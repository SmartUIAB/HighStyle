import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { ImagePath } from "@/Constants";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, FormGroup, Row, Spinner } from "reactstrap";
import ProfileStatus from "./ProfileStatus";
import TabProfile from "./TabProflle";
import { useQuery } from "@apollo/client";
import { GET_USER } from "@/GraphQL/Queries/userQueries";

const Profile = () => {
  const { data: getUser, loading, refetch } = useQuery(GET_USER);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <Spinner style={{ color: '#ff8084' }} />
      </div>
    );
  }

  return (
    <Fragment>
      <CommonBreadcrumb title="Profile" parent="Settings" />
      <Container fluid>
        <Row>
          <Col xl="4">
            <Card>
              <CardBody>
                <div className="profile-details text-center">
                  <img
                    src={
                      getUser?.me?.image !== null
                        ? `${process.env.NEXT_PUBLIC_API_URL}${getUser?.me?.image}`
                        : `${ImagePath}/dashboard/designer.jpg`
                    }
                    alt=""
                    className="img-fluid img-90 rounded-circle blur-up lazyloaded"
                  />
                  <h5 className="f-w-600 f-16 mb-0">
                    {getUser?.me.firstname} {getUser?.me.lastname}
                  </h5>
                  <span>{getUser?.me.email}</span>
                  <div className="social">
                    <FormGroup className="btn-showcase">
                      <a
                        target="_blank"
                        href="https://www.facebook.com/#"
                        className="btn social-btn btn-fb d-inline-flex"
                      >
                        <i className="fa fa-facebook"></i>
                      </a>
                      <a
                        target="_blank"
                        href="https://www.google.com/"
                        className="btn social-btn btn-twitter d-inline-flex"
                      >
                        <i className="fa fa-google"></i>
                      </a>
                      <a
                        target="_blank"
                        href="https://twitter.com/?lang=en"
                        className="btn social-btn btn-google d-inline-flex me-0"
                      >
                        <i className="fa fa-twitter"></i>
                      </a>
                    </FormGroup>
                  </div>
                </div>
                <hr />
                <ProfileStatus />
              </CardBody>
            </Card>
          </Col>
          <Col xl="8">
            <Card className="profile-card">
              <CardBody>
                <TabProfile getUser={getUser} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Profile;
