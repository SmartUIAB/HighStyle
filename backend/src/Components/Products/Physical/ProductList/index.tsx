import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { Href } from "@/Constants";
import { ProductRating } from "@/Data/Product/Physical";
import { useQuery } from "@apollo/client";
import { Fragment } from "react";
import { Edit, Trash2 } from "react-feather";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { GET_PHYSICAL_PRODUCT } from '../../../../GraphQL/Queries/productQueries'

const ProductList = () => {

  const apiBaseUrl = "http://localhost:2024";
  const { data: allProductData } = useQuery(GET_PHYSICAL_PRODUCT);

  console.log(allProductData, 'allProductData');

  return (
    <Fragment>
      <CommonBreadcrumb title="Product List" parent="Physical" />
      <Container fluid>
        <Row className="products-admin ratio_asos">
          {allProductData?.physicalProducts?.products?.map((item: any, i: any) => {
            return (
              <Col xl="3" sm="6" key={i}>
                <Card>
                  <div className="products-admin">
                    <CardBody className="product-box">
                      <div className="img-wrapper">
                        <div className="lable-block">
                          <span className="lable3">{item.tags[0]}</span>
                        </div>
                        <div className="front">
                          <a href={Href} className="bg-size">
                            <img alt="" className="img-fluid blur-up bg-img lazyloaded" src={apiBaseUrl + item.images[0]} />
                          </a>
                          <div className="product-hover">
                            <ul>
                              <li>
                                <Button color="transparent">
                                  <Edit className="editBtn" />
                                </Button>
                              </li>
                              <li>
                                <Button color="transparent">
                                  <Trash2 className="deleteBtn" />
                                </Button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="product-detail">
                        {ProductRating}
                        <a href={Href}>
                          <h6>{item.title}</h6>
                        </a>
                        <h4>
                          {item.price} <del>{item.discount}</del>
                        </h4>
                        {item.colors && (
                          <ul className="color-variant">
                            {item.colors.map((color: any, index: any) => (
                              <li
                                key={index}
                                style={{ backgroundColor: color }}
                                className="color-item"
                              ></li>
                            ))}
                          </ul>
                        )}

                      </div>
                    </CardBody>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </Fragment>
  );
};

export default ProductList;
