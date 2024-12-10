//@ts-nocheck
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Card, CardBody, FormGroup, Input, Label } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_ALL_CATEGORY, GET_ALL_SUBCATEGORY } from "@/GraphQL/Queries/categoryQueries";

const GeneralForm = ({ formData, setFormData }) => {

  const { data: allCategoriesData } = useQuery(GET_ALL_CATEGORY);
  const { data: allSubCategoriesData } = useQuery(GET_ALL_SUBCATEGORY);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CommonCardHeader title="General" />
      <CardBody>
        <div className="digital-add needs-validation">
          <FormGroup>
            <Label className="col-form-label pt-0">
              <span>*</span> Title
            </Label>
            <Input
              id="validationCustom01"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label pt-0">
              <span>*</span> SKU
            </Label>
            <Input
              id="validationCustom02"
              type="text"
              name="SKU"
              value={formData.SKU}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Categories
            </Label>
            <select
              className="form-select"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              required
            >
              <option value="">--Select--</option>
              {allCategoriesData?.categorieslist
                ?.filter((item: any) => item.type === "Digital")
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Subcategory
            </Label>
            <select
              className="form-select"
              name="subcategory"
              value={formData.subcategory || ""}
              onChange={handleChange}
              required
            >
              <option value="" disabled>--Select--</option>
              {allSubCategoriesData?.subcategorieslist
                ?.filter((item: any) => (item.type === "Digital" && item.category.id === formData.category))
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Product Price
            </Label>
            <Input
              id="validationCustom03"
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Compatibility
            </Label>
            <Input
              id="validationCustom04"
              type="text"
              name="compatibility"
              value={formData.compatibility}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Discount
            </Label>
            <Input
              id="validationCustom05"
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> File Format
            </Label>
            <Input
              id="validationCustom06"
              type="text"
              name="fileFormat"
              value={formData.fileFormat}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> File Size
            </Label>
            <Input
              id="validationCustom07"
              type="text"
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> License Type
            </Label>
            <Input
              id="validationCustom08"
              type="text"
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Tags
            </Label>
            <Input
              id="validationCustom09"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Version
            </Label>
            <Input
              id="validationCustom10"
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> Status
            </Label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="" disabled>--Select--</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </FormGroup>
        </div>
      </CardBody>
    </Card>
  );
};

export default GeneralForm;
