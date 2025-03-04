import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useState } from "react";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { CREATE_SUB_CATEGORY } from "../../../../GraphQL/Mutations/categoryMutations";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_CATEGORY, GET_SUB_CATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { toast } from "react-toastify";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { subCategorySchema } from "@/utils/validation";

const SubCategoryDigital = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const handleSelect = (selectedType: string) => {
    setType(selectedType);
  };

  const [createSubCategory] = useMutation(CREATE_SUB_CATEGORY);

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const onOpenModal = () => {
    setOpen(true);
    setName('');
    setType('');
    setDescription('');
    setCategory('');
    setImage(null);
  };
  const onCloseModal = () => {
    setOpen(false);
    setName('');
    setType('');
    setDescription('');
    setCategory('');
    setImage(null);
    setErrors({})
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
    await subCategorySchema.validate(
      { name, description, type, category, image },
      { abortEarly: false }
    );
    try {
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
      if (error.inner) {
        const validationErrors: { [key: string]: string } = error.inner.reduce(
          (acc: any, error: any) => {
            acc[error.path] = error.message;
            return acc;
          },
          {}
        );
        setErrors(validationErrors)
      }
      else {
        toast.error(error.message);
      }
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title={t("digital.add_product.Subcategory")} parent={t("type.digital")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Product Sub Category" />
              <CardBody>
                <div className="btn-popup pull-right">
                  <ButtonGroup className="btn-popup pull-right">
                    <Button color="primary" onClick={onOpenModal}>
                      {t("modalTitle.addSubCategory")}
                    </Button>
                  </ButtonGroup>
                  <Modal isOpen={open} toggle={onCloseModal}>
                    <ModalHeader toggle={onCloseModal}>
                      <h5 className="modal-title f-w-600" id="exampleModalLabel2">
                        {t("modalTitle.addSubCategory")}
                      </h5>
                    </ModalHeader>
                    <ModalBody>
                      <Form>
                        <FormGroup>
                          <Label htmlFor="category" className="col-form-label">
                            {t("subCategory.category")}:
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
                          {errors.category && <div className="errorMsg">{errors.category}</div>}
                        </FormGroup>

                        <FormGroup>
                          <Label>{t("subCategory.name")}:</Label>
                          <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                          {errors.name && <div className="errorMsg">{errors.name}</div>}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="type" className="col-form-label">
                            {t("subCategory.type")}:
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
                            <option value="Physical">{t("type.physical")}</option>
                            <option value="Digital">{t("type.digital")}</option>
                          </Input>
                          {errors.type && <div className="errorMsg">{errors.type}</div>}
                        </FormGroup>

                        <FormGroup>
                          <Label>{t("subCategory.description")}:</Label>
                          <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                          {errors.description && <div className="errorMsg">{errors.description}</div>}
                        </FormGroup>
                        <FormGroup>
                          <Label>{t("table.image")}:</Label>
                          <Input type="file" onChange={handleFileChange} />
                          {errors.image && <div className="errorMsg">{errors.image}</div>}
                        </FormGroup>
                      </Form>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" onClick={handleSave}>
                        {t("subCategory.save")}
                      </Button>
                      <Button color="secondary" onClick={onCloseModal}>
                        {t("category.close")}
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
                      totalItem: subcategoriesData.length
                    }}
                    myClass="-striped -highlight"
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
