import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useState } from "react";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { CREATE_SUB_CATEGORY } from "../../../../GraphQL/Mutations/categoryMutations";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_CATEGORY, GET_SUB_CATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { toast } from "react-toastify";

const SubCategoryDigital = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const handleSelect = (selectedType: string) => {
    setType(selectedType);
  };

  const [createSubCategory] = useMutation(CREATE_SUB_CATEGORY);

  const onOpenModal = () => {
    setOpen(true);
  };
  const onCloseModal = () => {
    setOpen(false);
  };

  const { data, loading, error, refetch } = useQuery(GET_SUB_CATEGORY, {
    variables: {
      pagination: {
        page,
        limit,
      },
    },
  });

  const { data: allCategoriesData } = useQuery(GET_ALL_CATEGORY);

  const subcategoriesData = data?.subcategories?.subcategories.filter((item: any) => item.type === 'Digital') || [];

  console.log(subcategoriesData, data, '-=-=-=-=-=');


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };


  const handleSave = async () => {
    try {
      if (!name || !type) {
        console.error("Name and Type are required fields.");
        return;
      }

      if (!category) {
        console.error("Category is required field.");
        return;
      }

      if (!image) {
        console.error("Image is required.");
        return;
      }

      const { data } = await createSubCategory({
        variables: {
          name: name,
          description: description,
          image: image,
          type: type,
          categoryId: category,
        },
      });

      if (data) {
        toast.success("SubCategory created successfully");
        setOpen(false);
        setName('');
        setType('');
        setDescription('');
        setCategory('');
        setImage(null);
        refetch();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Sub Category" parent="Physical" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Product Sub Category" />
              <CardBody>
                <div className="btn-popup pull-right">
                  <ButtonGroup className="btn-popup pull-right">
                    <Button color="primary" onClick={onOpenModal}>
                      Add Sub Category
                    </Button>
                  </ButtonGroup>
                  <Modal isOpen={open} toggle={onCloseModal}>
                    <ModalHeader toggle={onCloseModal}>
                      <h5 className="modal-title f-w-600" id="exampleModalLabel2">
                        Add Sub Category
                      </h5>
                    </ModalHeader>
                    <ModalBody>
                      <Form>
                        <FormGroup>
                          <Label htmlFor="category" className="col-form-label">
                            Category:
                          </Label>
                          <Input
                            id="category"
                            type="select"
                            name="category"
                            value={category || ""}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="" disabled>
                              Select category
                            </option>
                            {allCategoriesData?.categorieslist
                              ?.filter((item: any) => item.type === "Digital")
                              .map((item: any) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                          </Input>
                        </FormGroup>

                        <FormGroup>
                          <Label>Sub Category Name:</Label>
                          <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            value={type || ""}
                            onChange={(e) => handleSelect(e.target.value)}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Physical">Physical</option>
                            <option value="Digital">Digital</option>
                          </Input>
                        </FormGroup>

                        <FormGroup>
                          <Label>Sub Category Description:</Label>
                          <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>Sub Category Image:</Label>
                          <Input type="file" onChange={handleFileChange} />
                        </FormGroup>
                      </Form>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" onClick={handleSave}>
                        Save
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
                    myData={subcategoriesData}
                    multiSelectOption={false}
                    pagination={{
                      onChangePage: handlePageChange,
                      onChangeRowsPerPage: handleLimitChange,
                      pageSize: limit,
                      totalItem: data?.subcategories.total
                    }}
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
export default SubCategoryDigital;
