import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_CATEGORY } from "../../../../GraphQL/Mutations/categoryMutations";
import { GET_CATEGORY } from "../../../../GraphQL/Queries/categoryQueries";

import { toast } from "react-toastify";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { categorySchema } from "@/utils/validation";

const CategoryDigital = () => {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    type: "",
    image: null as File | null,
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});



  const [createCategory] = useMutation(CREATE_CATEGORY);

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormValues({ ...formValues, image: e.target.files[0] });
    }
  };

  const { data, loading, error, refetch } = useQuery(GET_CATEGORY, {
    variables: {
      pagination: {
        page,
        limit,
      },
    },
  });

  const categoriesData = data?.categories?.categories.filter((item: any) => item.type == 'Digital') || [];
  const handleSave = async () => {
    setErrors({});
    try {
      await categorySchema.validate(formValues, { abortEarly: false });
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
      return; // Stop execution if validation fails
    }
    try {
      const { data } = await createCategory({
        variables: {
          name: formValues.name,
          description: formValues.description,
          image: formValues.image,
          type: formValues.type,
        },
      });

      if (data) {
        toast.success("Category created successfully");
        setOpen(false);
        setFormValues({
          name: "",
          description: "",
          image: null,
          type: "",
        })
        refetch();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const onOpenModal = () => {
    setOpen(true);
  };
  const onCloseModal = () => {
    setOpen(false);
    setErrors({})
  };

  return (
    <Fragment>
      <CommonBreadcrumb title={t("subCategory.category")} parent={t("type.physical")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Product Category" />
              <CardBody>
                <div className="btn-popup pull-right">
                  <Button color="primary" onClick={onOpenModal}>
                    {t("modalTitle.addCategory")}
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
                          <Label>{t("category.name")}:</Label>
                          <Input
                            type="text"
                            name="name"
                            value={formValues.name}
                            onChange={handleInputChange}
                          />
                          {errors.name && <div className="errorMsg">{errors.name}</div>}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="type" className="col-form-label">
                            {t("category.type")}:
                          </Label>
                          <Input
                            id="type"
                            type="select"
                            name="type"
                            value={formValues.type}
                            onChange={handleInputChange}
                          >
                            <option value="" selected disabled>
                              Select type
                            </option>
                            <option value="Physical">{t("type.physical")}</option>
                            <option value="Digital">{t("type.digital")}</option>
                          </Input>
                          {errors.type && <div className="errorMsg">{errors.type}</div>}
                        </FormGroup>
                        <FormGroup>
                          <Label>{t("category.description")}:</Label>
                          <Input
                            type="text"
                            name="description"
                            value={formValues.description}
                            onChange={handleInputChange}
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
                        {t("category.add")}
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
                    myData={categoriesData}
                    multiSelectOption={false}
                    pagination={{
                      onChangePage: handlePageChange,
                      onChangeRowsPerPage: handleLimitChange,
                      pageSize: limit,
                      totalItem: categoriesData?.length
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

export default CategoryDigital;