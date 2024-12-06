import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { Fragment, useState } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import GeneralForm from "./GeneralForm";
import MetaDataForm from "./MetaDataForm";
import DescriptionForm from "./DescriptionForm";
import MyUploader from "@/CommonComponents/CommonDropzone";
import { useMutation } from "@apollo/client";
import { CREATE_DIGITAL_PRODUCT } from '../../../../GraphQL/Mutations/productMutation'
import { toast } from "react-toastify";

const AddDigitalProduct = () => {

  const [formData, setFormData] = useState({
    title: "",
    SKU: "",
    category: "",
    compatibility: "",
    description: "",
    price: "",
    discount: "",
    status: "",
    metaTitle: "",
    metaDescription: "",
    fileFormat: "",
    fileSize: "",
    licenseType: "",
    subcategory: "",
    tags: "",
    version: "",
    images: ""
  })

  const [createDigitalProduct] = useMutation(CREATE_DIGITAL_PRODUCT);

  const handleValidSubmit = async () => {
    try {
      const { data } = await createDigitalProduct({
        variables: {
          input: {
            SKU: formData.SKU,
            category: formData.category,
            compatibility: formData.compatibility.split(','),
            description: formData.description,
            discount: parseFloat(formData.discount),
            fileFormat: formData.fileFormat,
            fileSize: formData.fileSize,
            licenseType: formData.licenseType,
            metaDescription: formData.metaDescription,
            metaTitle: formData.metaTitle,
            price: parseFloat(formData.price),
            status: formData.status,
            subcategory: formData.subcategory,
            tags: formData.tags.split(','),
            title: formData.title,
            version: formData.version
          },
          images: formData.images
        }
      });

      if (data) {
        toast.success("Digital Product Created Successfully");
        setFormData({
          title: "",
          SKU: "",
          category: "",
          compatibility: "",
          description: "",
          discount: "",
          fileFormat: "",
          fileSize: "",
          licenseType: "",
          metaDescription: "",
          metaTitle: "",
          price: "",
          status: "",
          subcategory: "",
          tags: "",
          version: "",
          images: ""
        });
      }
    } catch (error) {
      console.error("Error creating digital product:", error);
      toast.error("Failed to create digital product. Please try again.");
    }
  };


  return (
    <Fragment>
      <CommonBreadcrumb title="Add Products" parent="Digital" />
      <Container fluid>
        <Row className="product-adding">
          <Col xl="6">
            <GeneralForm formData={formData} setFormData={setFormData} />
          </Col>
          <Col xl="6">
            <MyUploader formData={formData} setFormData={setFormData} />
            <DescriptionForm formData={formData} setFormData={setFormData} />
            <MetaDataForm formData={formData} setFormData={setFormData} />
            <div className="offset-xl-3 offset-sm-4 mt-3 d-flex gap-2">
              <Button
                type="submit"
                onClick={handleValidSubmit}
                color="primary"
              >
                Add
              </Button>
              <Button color="light">Discard</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
}

export default AddDigitalProduct;
