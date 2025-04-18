//@ts-nocheck
import dynamic from "next/dynamic";
import { Fragment, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import {
  DELETE_CATEGORY,
  DELETE_SUB_CATEGORY,
  UPDATE_CATEGORY,
  UPDATE_SUB_CATEGORY,
} from "../GraphQL/Mutations/categoryMutations";
import { useMutation, useQuery } from "@apollo/client";
import { usePathname } from "next/navigation";
import { GET_ALL_CATEGORY, SUB_CATEGORY_ID } from "@/GraphQL/Queries/categoryQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

const Datatable = ({
  myData,
  myClass,
  multiSelectOption,
  pagination,
}: {
  myData: any[];
  myClass?: string;
  multiSelectOption?: boolean;
  pagination: {
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (size: number) => void;
    pageSize: number;
    totalItem: number;
  };
}) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const { onChangePage, onChangeRowsPerPage, pageSize, totalItem } = pagination;

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [data, setData] = useState(myData);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [deleteSubCategory] = useMutation(DELETE_SUB_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [updateSubCategory] = useMutation(UPDATE_SUB_CATEGORY);
  const { data: allCategoriesData } = useQuery(GET_ALL_CATEGORY);
  const route = usePathname();
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  useEffect(() => {
    setData(myData);
  }, [myData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleModal = (row?: any) => {
    setSelectedRow(row || null);
    setOpen((prevState) => !prevState);
  };

  const handleDelete = async (row: any) => {
    try {
      const mutation =
        route?.includes("category") && !route?.includes("sub-category")
          ? deleteCategory
          : deleteSubCategory;

      const variables = route?.includes("category")
        ? { deleteCategoryId: row.id }
        : { deleteSubcategoryId: row.id };

      const { data } = await mutation({ variables });
      if (data) {
        const successMessage = route?.includes("sub-category")
          ? t("toast.success.deleteSubCategory")
          : t("toast.success.deleteCategory");
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(t("toast.error.delete"));
    }
  };

  const handleUpdate = async () => {
    try {
      const mutation = route?.includes("category") && !route?.includes("sub-category")
        ? updateCategory
        : updateSubCategory;

      const variables = {
        name: name || selectedRow.name,
        type: type || selectedRow.type,
        description: description || selectedRow.description,
        image: image || selectedRow.image,
        ...(route?.includes("sub-category")
          ? { updateSubcategoryId: selectedRow.id }
          : { updateCategoryId: selectedRow.id }),
      };

      const { data } = await mutation({ variables });
      if (data) {
        const successMessage = route?.includes("sub-category")
          ? t("toast.success.subCategory")
          : t("toast.success.category");
        toast.success(successMessage);
        toggleModal();
      }
    } catch (error) {
      toast.error(t("toast.error.update"));
    }
  };

  const columns = [
    {
      name: <b>{t("table.image")}</b>,
      cell: (row: any) => (
        <img
          src={apiBaseUrl + row.image}
          alt={row.name}
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
      sortable: false,
      style: { textAlign: "center" },
    },
    {
      name: <b>{t("table.name")}</b>,
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: <b>{t("table.description")}</b>,
      selector: (row: any) => row.description,
      sortable: true,
    },
    {
      name: <b>{t("table.type")}</b>,
      selector: (row: any) => row.type,
      sortable: true,
    },
    {
      name: <b>{t("table.action")}</b>,
      cell: (row: any) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => toggleModal(row)}>
            <i className="fa fa-pencil" style={{ color: "rgb(40, 167, 69)", fontSize: "18px" }} />
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => handleDelete(row)}>
            <i className="fa fa-trash" style={{ color: "#e4566e", fontSize: "18px" }} />
          </span>
        </div>
      ),
      style: { textAlign: "center" },
      sortable: false,
    },
  ];

  return (
    <Fragment>
      <DataTable
        data={data}
        columns={columns}
        className={myClass}
        pagination
        paginationServer
        paginationTotalRows={totalItem}
        paginationPerPage={pageSize}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        striped
        center
      />
      <ToastContainer />

      {open && (
        <Modal isOpen={open} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>{t("modalTitle.editCategory")}</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label>{t("category.name")}</Label>
                <Input
                  type="text"
                  value={name || selectedRow?.name || ""}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>{t("category.type")}</Label>
                <Input
                  type="select"
                  value={type || selectedRow?.type || ""}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="" disabled>
                    {t("select.type")}
                  </option>
                  <option value="Physical">{t("type.physical")}</option>
                  <option value="Digital">{t("type.digital")}</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>{t("category.description")}</Label>
                <Input
                  type="text"
                  value={description || selectedRow?.description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>{t("category.image")}</Label>
                <Input type="file" onChange={handleFileChange} />
                {imagePreview || selectedRow?.image ? (
                  <img
                    src={imagePreview || apiBaseUrl + selectedRow?.image}
                    alt="Preview"
                    style={{ width: "100%", height: "215px" }}
                  />
                ) : null}
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleUpdate}>
              {t("category.update")}
            </Button>
            <Button color="secondary" onClick={toggleModal}>
              {t("category.close")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Fragment>
  );
};

export default Datatable;
