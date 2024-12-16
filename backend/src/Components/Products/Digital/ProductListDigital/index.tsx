import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import { Edit, Trash2 } from "react-feather";
import { Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from "reactstrap";
import { GET_DIGITAL_PRODUCT } from '../../../../GraphQL/Queries/productQueries';
import { useState } from "react";
import { DELETE_DIGITAL_PRODUCT } from "@/GraphQL/Mutations/productMutation";
import { toast } from "react-toastify";
import Link from "next/link";

const ProductListDigital = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleteId, setIsDeleteId] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allProductData, refetch, loading } = useQuery(GET_DIGITAL_PRODUCT);
  const [deleteDigitalProduct] = useMutation(DELETE_DIGITAL_PRODUCT);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const filteredProducts = allProductData?.digitalProducts?.products?.filter((item: any) => {
    return statusFilter ? item.status === statusFilter : true;
  });

  const handleDeleteDigitalProduct = async () => {
    if (isDeleteId) {
      try {
        const { data } = await deleteDigitalProduct({
          variables: { deleteDigitalProductId: isDeleteId },
        });

        if (data) {
          toast.success("Deleted Digital Product successfully");
          setModalOpen(false);
          refetch()
        }
      } catch (error) {
        toast.error(`Error deleting digital product: ${error.message || "Unknown error"}`);
        console.error("Error deleting digital product:", error);
      }
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <div className="py-5">
      <CommonBreadcrumb title="Product List" parent="Digital" />
      <div className="d-flex justify-content-end text-black w-100">
        <FormGroup>
          <select
            className="form-select"
            name="status"
            required
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </FormGroup>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner style={{ color: '#ff8084' }} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table mt-5 w-full" style={{ minWidth: "1200px" }}>
            <thead>
              <tr>
                <th className="text-uppercase">Product</th>
                <th className="text-uppercase">Price</th>
                <th className="text-uppercase">Status</th>
                <th className="text-uppercase">File Format</th>
                <th className="text-uppercase">Compatibility</th>
                <th className="text-uppercase">Created At</th>
                <th className="text-uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">No Data Found</td>
                </tr>
              ) : (
                filteredProducts?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="d-flex gap-2">
                      <img
                        src={item.images && item.images.length > 0 ? process.env.NEXT_PUBLIC_API_URL + item.images[0] : '/assets/images/download.png'}
                        alt="no image"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <div className="d-flex flex-column">
                        <div>{item.title}</div>
                        <div>{item.SKU}</div>
                      </div>
                    </td>
                    <td className="align-middle">{item.price}</td>
                    <td className="align-middle"><span className="badge text-bg-success">{item?.status}</span></td>
                    <td className="align-middle">{item.fileFormat}</td>
                    <td className="align-middle">{item.compatibility.toString()}</td>
                    <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                    <td className="align-middle">
                      <Link href={`/en/products/digital/digital-add-product?id=${item.id}`}>
                        <Button color="transparent" className="p-1">
                          <Edit />
                        </Button>
                      </Link>
                      <Button color="transparent" className="p-1" onClick={() => { setIsDeleteId(item.id); toggleModal(); }}>
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this digital product?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          <Button color="primary" onClick={handleDeleteDigitalProduct}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductListDigital;
