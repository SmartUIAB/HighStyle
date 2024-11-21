import { Fragment, useState } from "react";
import { useMutation } from "@apollo/client";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { CREATE_CATEGORY } from "../../../../GraphQL/Mutations/authMutations";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { ProductCategoryData } from "@/Data/Product/Physical";

const Category = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Physical",
    image: null,
  });
  const [CreateCategory, { loading }] = useMutation(CREATE_CATEGORY);

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => {
    setOpen(false);
    setFormData({ name: "", description: "", type: "Physical", image: null });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0]; // Safely access the first file

    if (file) {
      console.log("Selected file:", file);

      // Update state with the selected file
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
    } else {
      console.log("No file selected.");
    }
  };


  const handleCreateCategory = async () => {
    const { name, description, type, image } = formData;

    if (!name.trim() || !description.trim()) {
      alert("Please fill out both the name and description fields.");
      return;
    }

    try {
      if (image) {
        console.log("first", image);
        try {
          const { data } = await CreateCategory({
            variables: { name, description, type, image },
          });
          console.log("Category created:", data);
          alert("Category created successfully!");
          onCloseModal();
        } catch (error) {
          console.error("Error creating category:", error);
          alert("Failed to create category. Please try again.");
        }
      }
    } catch (error) {
      const errorMessage =
        error.graphQLErrors?.[0]?.message || "Failed to create category.";
      console.error("Error creating category:", error);
      alert(errorMessage);
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Category" parent="Physical" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Product Category" />
              <CardBody>
                <div className="btn-popup pull-right">
                  <Button color="primary" onClick={onOpenModal}>
                    Add Category
                  </Button>
                  <Modal isOpen={open} toggle={onCloseModal}>
                    <ModalHeader toggle={onCloseModal}>
                      <h5 className="modal-title f-w-600" id="exampleModalLabel2">
                        Add Physical Product
                      </h5>
                    </ModalHeader>
                    <ModalBody>
                      <Form>
                        <FormGroup>
                          <Label htmlFor="name" className="col-form-label">
                            Category Name:
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="description" className="col-form-label">
                            Description:
                          </Label>
                          <Input
                            id="description"
                            type="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="type" className="col-form-label">
                            Type:
                          </Label>
                          <Input
                            id="type"
                            type="select"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                          >
                            <option value="Physical">Physical</option>
                            <option value="Digital">Digital</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="image" className="col-form-label">
                            Category Image:
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            name="image"
                            onChange={handleFileChange}
                          />
                        </FormGroup>
                      </Form>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={handleCreateCategory}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button color="secondary" onClick={onCloseModal}>
                        Close
                      </Button>
                    </ModalFooter>
                  </Modal>
                </div>
                <div className="clearfix"></div>
                <div id="basicScenario" className="product-physical">
                  <Datatable
                    myData={ProductCategoryData}
                    multiSelectOption={false}
                    pageSize={10}
                    pagination={true}
                    class="-striped -highlight"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Category;
