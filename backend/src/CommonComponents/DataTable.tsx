//@ts-nocheck
import dynamic from "next/dynamic";
import { Fragment, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { DELETE_CATEGORY, UPDATE_CATEGORY } from '../GraphQL/Mutations/categoryMutations'
import { useMutation } from "@apollo/client";

const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

const Datatable = ({ myData, myClass, multiSelectOption, pagination }: any) => {
  const { onChangePage, onChangeRowsPerPage, pageSize, totalItem } = pagination;
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const apiBaseUrl = "http://localhost:2024";
  const [checkedValues, setCheckedValues] = useState([]);
  const [data, setData] = useState(myData);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);


  const toggleModal = (row?: any) => {
    setSelectedRow(row || null);
    setOpen((prevState) => !prevState);
  };

  useEffect(() => {
    setData(myData);
  }, [myData]);

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleSelect = (type: string) => {
    setType(type);
    setDropdownOpen(false);
  };

  const handleDeleteCategory = async (row?: any) => {
    try {
      const { data } = await deleteCategory({
        variables: { deleteCategoryId: row.id },
      });

      if (data) {
        toast.success("Deleted Category successfully");
        refetch();
      }
    } catch (error) {
      toast.error("Failed to delete category. Please try again.");
    }
  };


  const handleUpdateCategory = async () => {
    try {
      const { data } = await updateCategory({
        variables: {
          updateCategoryId: selectedRow.id,
          name: name === '' ? selectedRow.name : name,
          type: type === '' ? selectedRow.type : type,
          description: description === '' ? selectedRow.description : description,
          image: image === '' ? selectedRow.image : [image],
        },
      });

      if (data) {
        toast.success("Category Updated Successfully");
        setOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };


  const columns = [
    {
      name: <b>Image</b>,
      selector: (row: any) => row.image,
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
      name: <b>Name</b>,
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: <b>Description</b>,
      selector: (row: any) => row.description,
      sortable: true,
    },
    {
      name: <b>Type</b>,
      selector: (row: any) => row.type,
      sortable: true,
    },
    {
      name: <b>Action</b>,
      cell: (row: any, index: number) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => toggleModal(row)}>
            <i
              className="fa fa-pencil"
              style={{ color: "rgb(40, 167, 69)", fontSize: "18px" }}
            />
          </span>
          <span style={{ cursor: "pointer" }} onClick={() => handleDeleteCategory(row)}>
            <i
              className="fa fa-trash"
              style={{ color: "#e4566e", fontSize: "18px" }}
            />
          </span>
        </div>
      ),
      style: { textAlign: "center" },
      sortable: false,
    },
  ];

  return (
    <div>
      <Fragment>
        <DataTable
          data={data}
          columns={columns}
          className={myClass}
          pagination
          paginationServer
          paginationTotalRows={totalItem}
          paginationPerPage={pageSize}
          onChangePage={(page) => {
            if (onChangePage) onChangePage(page);
          }}
          onChangeRowsPerPage={(newPageSize) => {
            if (onChangeRowsPerPage) onChangeRowsPerPage(newPageSize);
          }}
          striped
          center
        />
        <ToastContainer />
      </Fragment>

      <Modal isOpen={open} toggle={() => toggleModal()}>
        <ModalHeader toggle={() => toggleModal()}>
          <h5 className="modal-title f-w-600" id="exampleModalLabel2">
            {selectedRow ? "Edit Category" : "Add Category"}
          </h5>
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Category Name:</Label>
              <Input
                type="text"
                value={name || selectedRow?.name || ""}
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
                value={type || selectedRow?.type || "Select type"}
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
              <Label>Category Description:</Label>
              <Input
                type="text"
                value={description || selectedRow?.description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Category Image:</Label>
              <Input type="file" onChange={handleFileChange} />
              <div className="mt-3">
                <img
                  src={imagePreview || (selectedRow?.image ? apiBaseUrl + selectedRow?.image : '')}
                  alt="Image Preview"
                  style={{ width: '100%', height: '261px' }}
                />
              </div>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleUpdateCategory()}>
            Update
          </Button>
          <Button color="secondary" onClick={() => toggleModal()}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default Datatable;
