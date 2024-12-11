import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Edit, Trash2 } from "react-feather";
import { toast } from "react-toastify";
import { Button, Card, CardBody, CardHeader, Container, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import { DELETE_VENDOR } from '../../../GraphQL/Mutations/vendorMutations'
import { VENDOR_LIST } from '../../../GraphQL/Queries/vendorQueries'

const VendorsList = () => {
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
        toast.success("Deleted Vendor successfully");
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
      <CommonBreadcrumb title="Vendor List" parent="Vendors" />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>Vendor Details</h5>
          </CardHeader>
          <CardBody>
            <div className="btn-popup pull-right">
              <Link href='/en/vendors/create-vendors'>
                <Button color="secondary">
                  Create Vendor
                </Button>
              </Link>
            </div>
            <div className="clearfix"></div>
            <div id="batchDelete" className="category-table user-list order-table coupon-list-delete">
              <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr>
                    <th className="text-uppercase">Name</th>
                    <th className="text-uppercase">Business Type</th>
                    <th className="text-uppercase">Contact Number</th>
                    <th className="text-uppercase">Email</th>
                    <th className="text-uppercase">address</th>
                    <th className="text-uppercase">status</th>
                    <th className="text-uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.vendors?.vendors?.map((vendor: any) => (
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
                        <Link href={`/en/vendors/create-vendors?id=${vendor.id}`}>
                          <Button color="transparent" className="p-1">
                            <Edit />
                          </Button>
                        </Link>
                        <Button color="transparent" className="p-1">
                          <Trash2 onClick={() => {
                            setIsDeleteId(vendor.id);
                            toggleModal();
                          }} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this Vendor?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          <Button color="primary" onClick={handleDeleteVendor}>Delete</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default VendorsList;
