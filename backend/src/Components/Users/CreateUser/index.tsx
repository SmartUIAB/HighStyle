import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import UserTabs from "./UserTabs";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const CreateUser = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <Fragment>
      <CommonBreadcrumb title={t("user.userlist.create_user")} parent={t("user.userlist.users")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("user.create_user.title")} />
              <CardBody>
                <UserTabs />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default CreateUser;
