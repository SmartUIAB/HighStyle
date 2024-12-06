import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Fragment, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import ProductCodePrice from "./ProductCodeAndPrice";
import ProductImages from "./ProductImages";
import ProductSizeAndDescription from "./ProductSizeAndDescription";
import TotalProducts from "./TotalProducts";
import { useMutation } from "@apollo/client";
import { CREATE_PHYSICAL_PRODUCT } from "../../../../GraphQL/Mutations/productMutation";
import { toast } from "react-toastify";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    product_sku: "",
    product_size: "",
    product_images: "",
    product_category: "",
    product_color: "",
    product_discount: "",
    product_meta_title: "",
    product_meta_description: "",
    product_status: "",
    product_stockquantity: 0,
    product_tags: "",
    product_subcategory: ""
  })

  const [createPhysicalProduct] = useMutation(CREATE_PHYSICAL_PRODUCT);

  const handleValidSubmit = async () => {
    try {
      const { data } = await createPhysicalProduct({
        variables: {
          input: {
            SKU: formData.product_sku,
            category: formData.product_category,
            colors: formData.product_color.split(','),
            description: formData.product_description,
            discount: parseFloat(formData.product_discount),
            metaDescription: formData.product_meta_description,
            metaTitle: formData.product_meta_title,
            price: parseFloat(formData.product_price),
            sizes: formData.product_size.split(','),
            status: formData.product_status,
            stockQuantity: formData.product_stockquantity,
            subcategory: formData.product_subcategory,
            tags: formData.product_tags.split(','),
            title: formData.product_name
          },
          images: formData.product_images
        },
      });

      if (data) {
        toast.success("Physical Product Created Successfully");
        setFormData({
          product_name: "",
          product_description: "",
          product_price: "",
          product_sku: "",
          product_size: "",
          product_images: "",
          product_category: "",
          product_color: "",
          product_discount: "",
          product_meta_title: "",
          product_meta_description: "",
          product_status: "",
          product_stockquantity: 0,
          product_subcategory: "",
          product_tags: ""
        })
      }
    } catch (error) {
      toast.error("Failed to create physical product. Please try again.");
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Add Product" parent="Physical" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Add Product" />
              <CardBody>
                <Row className="product-adding">
                  <ProductImages formData={formData} setFormData={setFormData} />
                  <Col xl="7">
                    <div className="needs-validation add-product-form" onSubmit={handleValidSubmit}>
                      <ProductCodePrice formData={formData} setFormData={setFormData} />
                      <TotalProducts formData={formData} setFormData={setFormData} />
                      <ProductSizeAndDescription formData={formData} setFormData={setFormData} />
                      <div className="offset-xl-3 offset-sm-4">
                        <Button type="submit" onClick={handleValidSubmit} color="primary">
                          Add
                        </Button>
                        <Button color="light">Discard</Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AddProduct;