import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { COUPON_LIST } from "../../../GraphQL/Queries/couponQueries";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Edit, Trash2 } from "react-feather";
import { toast } from "react-toastify";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import { DELETE_COUPON } from "@/GraphQL/Mutations/couponMutations";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const ListCoupons = () => {
  const [isDeleteId, setIsDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: allCouponData, refetch, loading } = useQuery(COUPON_LIST);
  const [deleteCoupon] = useMutation(DELETE_COUPON);

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleDeleteCoupon = async () => {
    try {
      setIsDeleting(true);
      const { data } = await deleteCoupon({
        variables: { ids: [isDeleteId] },
      });
      if (data) {
        toast.success("Deleted Coupon successfully");
        setModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Error deleting Coupon:", error);
      toast.error("Failed to delete Coupon");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const toggleModal = () => setModalOpen(!modalOpen);
  const lang = localStorage.getItem("i18nextLng")

  return (
    <Fragment>
      <CommonBreadcrumb title={t("coupon.couponlist.breadcrumb_list_coupons")} parent={t("coupon.couponlist.coupons")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("coupon.couponlist.title")} />
              <CardBody>
                <div id="batchDelete" className="category-table order-table coupon-list-delete">
                  {loading ? (
                    <div className="text-center">
                      <Spinner style={{ color: '#ff8084' }} />
                    </div>
                  ) : (
                    <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                      <thead>
                        <tr>
                          <th className="text-uppercase">{t("coupon.couponlist.name")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.code")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.status")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.discount_type")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.discount_value")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.start_date")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.end_date")}</th>
                          <th className="text-uppercase">{t("coupon.couponlist.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allCouponData?.getAllCoupons?.coupons?.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center">{t("coupon.couponlist.no_coupon_found")}</td>
                          </tr>
                        ) : (
                          allCouponData?.getAllCoupons?.coupons?.map((item: any, i: any) => (
                            <tr key={i}>
                              <td className="align-middle">{item.name}</td>
                              <td className="align-middle">{item.code}</td>
                              <td className="align-middle">
                                {item.statusActive ? "Active" : "Expired"}
                              </td>
                              <td className="align-middle">{item.discountType}</td>
                              <td className="align-middle">{item.discountValue}</td>
                              <td className="align-middle">{formatedDate(parseInt(item.startDate))}</td>
                              <td className="align-middle">{formatedDate(parseInt(item.endDate))}</td>
                              <td className="align-middle">
                                <Link href={`/${lang}/coupons/create-coupons?id=${item.id}`}>
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
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered">
        <ModalHeader toggle={toggleModal}>{t("coupon.couponlist.confirmDeletionTitle")}</ModalHeader>
        <ModalBody>
          {t("coupon.couponlist.confirmDeletionMessage")}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>{t("coupon.couponlist.cancel")}</Button>
          <Button color="primary" onClick={handleDeleteCoupon} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : t("coupon.couponlist.delete")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default ListCoupons;
