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
import { useMutation } from "@apollo/client";
import { usePathname } from "next/navigation";
import { GET_ALL_CATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

const Datatable = ({
  myData,
  myClass,
  multiSelectOption,
  pagination,
}) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const { onChangePage, onChangeRowsPerPage, pageSize, totalItem } = pagination;

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState(myData);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_CATEGORY }],
  });
  const [deleteSubCategory] = useMutation(DELETE_SUB_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_CATEGORY }],
  });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_CATEGORY }],
  });
  const [updateSubCategory] = useMutation(UPDATE_SUB_CATEGORY, {
    refetchQueries: [{ query: GET_ALL_CATEGORY }],
  });

  const route = usePathname();
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  useEffect(() => {
    setData(myData);
  }, [myData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleModal = (row) => {
    setSelectedRow(row || null);
    setName(row?.name || "");
    setType(row?.type || "");
    setDescription(row?.description || "");
    setImagePreview(row?.image ? apiBaseUrl + row.image : null);
    setImage(null); // Reset to allow change
    setOpen((prev) => !prev);
  };

  const handleDelete = async (row) => {
    try {
      const isCategory = route?.includes("category") && !route?.includes("sub-category");
      const mutation = isCategory ? deleteCategory : deleteSubCategory;

      const variables = { id: row.id }; // adjust to match your backend

      const { data } = await mutation({
        variables,
        refetchQueries: [{ query: GET_ALL_CATEGORY }], // Make sure this matches your query
      });

      if (data) {
        toast.success(
          isCategory
            ? t("toast.success.deleteCategory")
            : t("toast.success.deleteSubCategory")
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error.delete"));
    }
  };


  const handleUpdate = async () => {
    if (!selectedRow) return;

    try {
      const isCategory = route?.includes("category") && !route?.includes("sub-category");
      const mutation = isCategory ? updateCategory : updateSubCategory;

      const baseVariables = {
        name,
        type,
        description,
        ...(isCategory
          ? { updateCategoryId: selectedRow.id }
          : { updateSubcategoryId: selectedRow.id }),
      };

      // Handle image upload if needed
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch(`${apiBaseUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        const { filePath } = await response.json();
        baseVariables.image = filePath;
      }

      await mutation({ variables: baseVariables });

      toast.success(
        isCategory
          ? t("toast.success.category")
          : t("toast.success.subCategory")
      );

      toggleModal();
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error.update"));
    }
  };

  const columns = [
    {
      name: <b>{t("table.image")}</b>,
      cell: (row) => (
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
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: <b>{t("table.description")}</b>,
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: <b>{t("table.type")}</b>,
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: <b>{t("table.action")}</b>,
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => toggleModal(row)}>
            <i className="fa fa-pencil" style={{ color: "rgb(40, 167, 69)", fontSize: "18px" }} />
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => handleDelete(row)}>
            <i className="fa fa-trash" style={{ color: "#e4566e", fontSize: "18px" }} />
          </span>
        </div>
      ),
      sortable: false,
      style: { textAlign: "center" },
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
        <Modal isOpen={open} toggle={() => toggleModal()}>
          <ModalHeader toggle={() => toggleModal()}>
            {t("modalTitle.editCategory")}
          </ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label>{t("category.name")}</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>{t("category.type")}</Label>
                <Input
                  type="select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="" disabled>{t("select.type")}</option>
                  <option value="Physical">{t("type.physical")}</option>
                  <option value="Digital">{t("type.digital")}</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>{t("category.description")}</Label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>{t("category.image")}</Label>
                <Input type="file" onChange={handleFileChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "100%", height: "215px" }}
                  />
                )}
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleUpdate}>
              {t("category.update")}
            </Button>
            <Button color="secondary" onClick={() => toggleModal()}>
              {t("category.close")}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Fragment>
  );
};

export default Datatable;
