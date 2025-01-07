import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { DELETE_USER } from "@/GraphQL/Mutations/userMutations";
import { USER_LIST } from "@/GraphQL/Queries/userQueries";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Edit, Trash2 } from "react-feather";
import { toast } from "react-toastify";
import { Button, Card, CardBody, CardHeader, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";

const UserList = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteId, setIsDeleteId] = useState(null);

  const { data, loading, error, refetch } = useQuery(USER_LIST);
  const [deleteUser] = useMutation(DELETE_USER)

  if (loading) return <div className="d-flex justify-content-center py-5">
    <Spinner style={{ color: '#ff8084' }} />
  </div>;
  if (error) return <p>Error fetching user list</p>;

  const handleDeletePhysicalProduct = async () => {
    try {
      const { data } = await deleteUser({
        variables: { userId: isDeleteId },
      });
      if (data) {
        toast.success("Deleted User successfully");
        setModalOpen(false);
        refetch()
      }
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error("Failed to delete User");
    }
  }

  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <Fragment>
      <CommonBreadcrumb title="User List" parent="Users" />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>User Details</h5>
          </CardHeader>
          <CardBody>
            <div className="btn-popup pull-right">
              <Link href='/en/users/create-user'>
                <Button color="secondary">
                  Create User
                </Button>
              </Link>
            </div>
            <div className="clearfix"></div>
            <div id="batchDelete" className="category-table user-list order-table coupon-list-delete">
              <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th className="text-uppercase">Profile Image</th>
                    <th className="text-uppercase">First Name</th>
                    <th className="text-uppercase">Last Name</th>
                    <th className="text-uppercase">Email</th>
                    <th className="text-uppercase">Action</th>
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
                          <Link href={`/en/users/create-user?id=${user.id}`}>
                            <Button color="transparent" className="p-1">
                              <Edit />
                            </Button>
                          </Link>
                          <Button color="transparent" className="p-1">
                            <Trash2
                              onClick={() => {
                                setIsDeleteId(user.id);
                                toggleModal();
                              }}
                            />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No users found.
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
        <ModalHeader toggle={toggleModal}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this User?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          <Button color="primary" onClick={handleDeletePhysicalProduct}>Delete</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default UserList;
