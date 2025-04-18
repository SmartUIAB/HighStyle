import { useTranslation } from "@/app/i18n/client";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import Pagination from "@/CommonComponents/Pagination";
import { DELETE_USER } from "@/GraphQL/Mutations/userMutations";
import { USER_LIST } from "@/GraphQL/Queries/userQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { Button, Card, CardBody, CardHeader, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";

const UserList = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteId, setIsDeleteId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const { data, loading, error, refetch } = useQuery(USER_LIST);
  const [deleteUser] = useMutation(DELETE_USER)

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  if (loading) return <div className="d-flex justify-content-center py-5">
    <Spinner style={{ color: '#ff8084' }} />
  </div>;
  if (error) return <p>{t("user.userlist.fetchError")}</p>;

  const handleDeletePhysicalProduct = async () => {
    try {
      const { data } = await deleteUser({
        variables: { userId: isDeleteId },
      });
      if (data) {
        toast.success(t("toast.success.userDeleted"));
        setModalOpen(false);
        refetch()
      }
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error(t("toast.success.userDeleteError"));
    }
  }

  const toggleModal = () => setModalOpen(!modalOpen);
  const lang = localStorage.getItem("i18nextLng")

  const handlePageChange = (page: any) => {
    setPage(page)
    refetch({ page });
  };

  const handleRowsPerPageChange = ((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  });


  return (
    <Fragment>
      <CommonBreadcrumb title={t("user.userlist.title")} parent={t("user.userlist.users")} />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>{t("user.userlist.title")}</h5>
          </CardHeader>
          <CardBody>
            <div className="btn-popup pull-right">
              <Link href={`/${lang}/users/create-user`}>
                <Button color="secondary">
                  {t("user.userlist.create_user")}
                </Button>
              </Link>
            </div>
            <div className="clearfix"></div>
            <div id="batchDelete" className="category-table user-list order-table coupon-list-delete">
              <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th className="text-uppercase">{t("user.userlist.profile_image")}</th>
                    <th className="text-uppercase">{t("user.userlist.first_name")}</th>
                    <th className="text-uppercase">{t("user.userlist.last_name")}</th>
                    <th className="text-uppercase">{t("user.userlist.email")}</th>
                    <th className="text-uppercase">{t("user.userlist.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.userlist?.length > 0 ? (
                    data.userlist.map((user: any) => (
                      <tr key={user.id}>
                        <td>
                          <img
                            src={user.profileImage || '/assets/images/download.png'}
                            alt="Profile"
                            style={{ width: '50px', height: '50px' }}
                          />
                        </td>
                        <td className="align-middle">{user.firstname}</td>
                        <td className="align-middle">{user.lastname}</td>
                        <td className="align-middle">{user.email}</td>
                        <td className="align-middle">
                          <div style={{ display: "flex", justifyContent: "start", gap: "10px" }}>
                            <Link href={`/${lang}/users/create-user?id=${user.id}`}>
                              <span style={{ cursor: "pointer" }}>
                                <i className="fa fa-pencil" style={{ color: "rgb(40, 167, 69)", fontSize: "18px" }} />
                              </span>
                            </Link>
                            <span style={{ cursor: "pointer" }} onClick={() => {
                              setIsDeleteId(user.id);
                              toggleModal();
                            }}>
                              <i className="fa fa-trash" style={{ color: "#e4566e", fontSize: "18px" }} />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        {t("user.userlist.no_users_found")}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
            <Pagination
              count={data?.userlist?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </CardBody>
        </Card>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>{t("user.userlist.confirm_deletion")}</ModalHeader>
        <ModalBody>
          {t("user.userlist.confirm_message")}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}> {t("user.userlist.cancel")}</Button>
          <Button color="primary" onClick={handleDeletePhysicalProduct}> {t("user.userlist.delete")}</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default UserList;
