'use client'
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import { Edit, Eye, Trash2 } from "react-feather";
import { Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from "reactstrap";
import { GET_PHYSICAL_PRODUCT } from '../../../../GraphQL/Queries/productQueries'
import { useState } from "react";
import { DELETE_PHYSICAL_PRODUCT } from "@/GraphQL/Mutations/productMutation";
import { toast } from "react-toastify";
import Link from "next/link";

const ProductList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleteId, setIsDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allProductData, refetch, loading } = useQuery(GET_PHYSICAL_PRODUCT);
  const [deletePhysicalProduct] = useMutation(DELETE_PHYSICAL_PRODUCT)

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

  const filteredProducts = allProductData?.physicalProducts?.products?.filter((item: any) => {
    return statusFilter ? item.status === statusFilter : true;
  });

  const handleDeletePhysicalProduct = async () => {
    try {
      const { data } = await deletePhysicalProduct({
        variables: { deletePhysicalProductId: isDeleteId },
      });
      if (data) {
        toast.success("Deleted Physical Product successfully");
        setModalOpen(false);
        refetch()
      }
    } catch (error) {
      console.error("Error deleting physical product:", error);
      toast.error("Failed to delete Physical Product");
    }
  }

  const toggleModal = () => setModalOpen(!modalOpen);



  return (
    <div className="py-5">
      <CommonBreadcrumb title="Product List" parent="Physical" />
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
          <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th className="text-uppercase">Product</th>
                <th className="text-uppercase">Price</th>
                <th className="text-uppercase">Status</th>
                <th className="text-uppercase">Colors</th>
                <th className="text-uppercase">Sizes</th>
                <th className="text-uppercase">Category</th>
                <th className="text-uppercase">Created At</th>
                <th className="text-uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">No Data Found</td>
                </tr>
              ) : (
                filteredProducts?.map((item: any, i: any) => (
                  <tr key={i}>
                    <td className="d-flex gap-2">
                      <img
                        src={item.images && item.images.length > 0
                          ? process.env.NEXT_PUBLIC_API_URL + item.images[0]
                          : '/assets/images/download.png'}
                        alt="no image"
                        style={{ width: '50px', height: '50px' }}
                      />
                      <Link href={`/en/products/physical/product-detail?id=${item.id}`} >
                        <div className="d-flex flex-column">
                          <div>{item.title}</div>
                          <div>{item.SKU}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="align-middle">{item.price}$</td>
                    <td className="align-middle">
                      <span className={`badge text-bg-${item?.status !== 'Unavailable' ? 'success' : 'danger'}`}>
                        {item?.status}
                      </span>
                    </td>
                    <td className="align-middle">{item.colors.toString()}</td>
                    <td className="align-middle">{item.sizes !== null ? item.sizes.toString() : '-'}</td>
                    <td className="align-middle">{item.category?.name}</td>
                    <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                    <td className="align-middle">
                      <Link href={`/en/products/physical/add-product?id=${item.id}`}>
                        <Button color="transparent" className="p-1">
                          <Edit />
                        </Button>
                      </Link>
                      <Button color="transparent" className="p-1">
                        <Trash2 onClick={() => {
                          setIsDeleteId(item.id);
                          toggleModal();
                        }} />
                      </Button>
                    </td>
                  </tr>
                )
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this product?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          <Button color="primary" onClick={handleDeletePhysicalProduct}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductList;
