import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Edit, Trash2 } from "react-feather";
import { toast } from "react-toastify";
import { Button, Card, CardBody, CardHeader, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { DELETE_VENDOR } from '../../../GraphQL/Mutations/vendorMutations'
import { VENDOR_LIST } from '../../../GraphQL/Queries/vendorQueries'
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const VendorsList = () => {
    const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
    const { t } = useTranslation(i18LangStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteId, setIsDeleteId] = useState(null);

  const { data, loading, error, refetch } = useQuery(VENDOR_LIST);
  const [deleteUser] = useMutation(DELETE_VENDOR)

  if (loading) return <div className="d-flex justify-content-center py-5">
    <Spinner style={{ color: '#ff8084' }} />
  </div>;
  if (error) return <p>Error fetching user list</p>;

  const handleDeleteVendor = async () => {
    try {
      const { data } = await deleteUser({
        variables: { deleteVendorId: isDeleteId },
      });
      if (data) {
        toast.success(t("vendors.vendorList.deletedVendorSuccessfully"));
        setModalOpen(false);
        refetch()
      }
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error(t("vendors.vendorList.failedToDeleteVendor"));
    }
  }

  const toggleModal = () => setModalOpen(!modalOpen);

  const lang = localStorage.getItem("i18nextLng")

  return (
    <Fragment>
      <CommonBreadcrumb title={t("vendors.vendorList.title")} parent={t("vendors.vendorList.vendors")} />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>{t("vendors.vendorList.vendorDetails")}</h5>
          </CardHeader>
          <CardBody>
            <div className="btn-popup pull-right">
              <Link href={`/${lang}/vendors/create-vendors`}>
                <Button color="secondary">
                  {t("vendors.vendorList.createVendor")}
                </Button>
              </Link>
            </div>
            <div className="clearfix"></div>
            <div id="batchDelete" className="category-table user-list order-table coupon-list-delete">
              <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th className="text-uppercase">{t("vendors.vendorList.name")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.businessType")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.contactNumber")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.email")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.address")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.status")}</th>
                    <th className="text-uppercase">{t("vendors.vendorList.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.vendors?.vendors?.length > 0 ? (
                    data.vendors.vendorList.vendors.vendorList.map((vendor: any) => (
                      <tr key={vendor.id}>
                        <td>
                          <img
                            src={vendor.profileImage || '/assets/images/download.png'}
                            alt="Profile"
                            style={{ width: '50px', height: '50px' }}
                          />
                        </td>
                        <td className="align-middle">{vendor.name}</td>
                        <td className="align-middle">{vendor.businessType}</td>
                        <td className="align-middle">{vendor.email}</td>
                        <td className="align-middle">{vendor.address}</td>
                        <td className="align-middle">{vendor.status}</td>
                        <td className="align-middle">
                          <Link href={`/${lang}/vendors/create-vendors?id=${vendor.id}`}>
                            <Button color="transparent" className="p-1">
                              <Edit />
                            </Button>
                          </Link>
                          <Button color="transparent" className="p-1">
                            <Trash2
                              onClick={() => {
                                setIsDeleteId(vendor.id);
                                toggleModal();
                              }}
                            />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                          {t("vendors.vendorList.noVendorsFound")}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </CardBody>
        </Card>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>{t("vendors.vendorList.confirmDeletion")}</ModalHeader>
        <ModalBody>
          {t("vendors.vendorList.deleteConfirmationMessage")}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>{t("vendors.vendorList.cancel")}</Button>
          <Button color="primary" onClick={handleDeleteVendor}>{t("vendors.vendorList.delete")}</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default VendorsList;
