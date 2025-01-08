import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { Fragment, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_CATEGORY } from "../../../../GraphQL/Mutations/categoryMutations";
import { GET_CATEGORY } from "../../../../GraphQL/Queries/categoryQueries";

import { toast } from "react-toastify";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const Category = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSelect = (selectedType: string) => {
    setType(selectedType);
  };

  const [createCategory] = useMutation(CREATE_CATEGORY);

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
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

  const categoriesData = data?.categories?.categories.filter((item: any) => item.type == 'Physical') || [];

  const handleSave = async () => {
    try {
      if (!name || !type) {
        console.error("Name and Type are required fields.");
        return;
      }
      if (!image) {
        console.error("Image is required.");
        return;
      }

      const { data } = await createCategory({
        variables: {
          name: name,
          description: description,
          image: image,
          type: type,
        },
      });

      if (data) {
        toast.success("Category created successfully");
        setOpen(false);
        setName('');
        setType('');
        setDescription('');
        setImage(null);
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
  };

  return (
    <Fragment>
      <CommonBreadcrumb title={t("subCategory.category")} parent={t("type.physical")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("category.title")} />
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="type" className="col-form-label">
                            {t("category.type")}:
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
                        </FormGroup>
                        <FormGroup>
                          <Label>{t("category.description")}:</Label>
                          <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>{t("table.image")}:</Label>
                          <Input type="file" onChange={handleFileChange} />
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
                      totalItem: data?.categories?.total
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

export default Category;