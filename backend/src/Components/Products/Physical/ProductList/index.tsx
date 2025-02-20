'use client'
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import { Button, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from "reactstrap";
import { GET_PHYSICAL_PRODUCT } from '../../../../GraphQL/Queries/productQueries'
import { useState } from "react";
import { DELETE_PHYSICAL_PRODUCT } from "@/GraphQL/Mutations/productMutation";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import Pagination from "@/CommonComponents/Pagination";

const ProductList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleteId, setIsDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const { data: allProductData, refetch, loading } = useQuery(GET_PHYSICAL_PRODUCT);
  const [deletePhysicalProduct] = useMutation(DELETE_PHYSICAL_PRODUCT)

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  const toggleModal = () => setModalOpen(!modalOpen);
  const lang = localStorage.getItem("i18nextLng")

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

  const handlePageChange = (page: any) => {
    setPage(page)
    refetch({ page });
  };

  const handleRowsPerPageChange = ((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  });

  return (
    <div className="py-5">
      <CommonBreadcrumb title={t("physical.product_list.title")} parent={t("type.physical")} />
      <div className="d-flex justify-content-end text-black w-100">
        <FormGroup>
          <select
            className="form-select"
            name="status"
            required
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">{t("physical.product_list.statusFilter")}</option>
            <option value="Available">{t("physical.product_list.statusAvailable")}</option>
            <option value="Unavailable">{t("physical.product_list.statusUnavailable")}</option>
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
                <th className="text-uppercase">{t("physical.product_list.product")}</th>
                <th className="text-uppercase">{t("physical.product_list.price")}</th>
                <th className="text-uppercase">{t("physical.product_list.status")}</th>
                <th className="text-uppercase">{t("physical.product_list.colors")}</th>
                <th className="text-uppercase">{t("physical.product_list.sizes")}</th>
                <th className="text-uppercase">{t("physical.product_list.category")}</th>
                <th className="text-uppercase">{t("physical.product_list.createdAt")}</th>
                <th className="text-uppercase">{t("physical.product_list.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">{t("physical.product_list.noDataFound")}</td>
                </tr>
              ) : (
                filteredProducts?.map((item: any, i: any) => (
                  <tr key={i}>
                    <td className="d-flex gap-2">
                      <img
                        src={item.images && item.images.length > 0
                          ? process.env.NEXT_PUBLIC_API_URL + item.images[0]
                          : '/assets/images/download.png'}
                        alt={t("pysical.product_list.noImage")}
                        style={{ width: '50px', height: '50px' }}
                      />
                      <Link href={`/${lang}/products/physical/product-detail?id=${item.id}`} >
                        <div className="d-flex flex-column">
                          <div>{item.title}</div>
                          <div>{item.SKU}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="align-middle">{item.price.toFixed(2)}$</td>
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
                      <div style={{ display: "flex", justifyContent: "start", gap: "10px" }}>
                        <Link href={`/${lang}/products/physical/add-product?id=${item.id}`}>
                          <span style={{ cursor: "pointer" }}>
                            <i className="fa fa-pencil" style={{ color: "rgb(40, 167, 69)", fontSize: "18px" }} />
                          </span>
                        </Link>
                        <span style={{ cursor: "pointer" }} onClick={() => {
                          setIsDeleteId(item.id);
                          toggleModal()
                        }}>
                          <i className="fa fa-trash" style={{ color: "#e4566e", fontSize: "18px" }} />
                        </span>
                      </div>
                    </td>
                  </tr>
                )
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        count={filteredProducts?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>{t("physical.product_list.confirmDeletion")}</ModalHeader>
        <ModalBody>
          {t("physical.product_list.deleteConfirmationMessage")}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>{t("physical.product_list.cancel")}</Button>
          <Button color="primary" onClick={handleDeletePhysicalProduct}>{t("physical.product_list.delete")}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductList;
