//@ts-nocheck
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Card, CardBody, FormGroup, Input, Label } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_ALL_CATEGORY, GET_ALL_SUBCATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const GeneralForm = ({ formData, setFormData,errors }) => {

  const { data: allCategoriesData } = useQuery(GET_ALL_CATEGORY);
  const { data: allSubCategoriesData } = useQuery(GET_ALL_SUBCATEGORY);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CommonCardHeader title={t("digital.add_product.General")} />
      <CardBody>
        <div className="digital-add needs-validation">
          <FormGroup>
            <Label className="col-form-label pt-0">
              <span>*</span> {t("digital.add_product.Title")}
            </Label>
            <Input
              id="validationCustom01"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors?.title && <div className="errorMsg">{errors?.title}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label pt-0">
              <span>*</span> {t("digital.add_product.SKU")}
            </Label>
            <Input
              id="validationCustom02"
              type="text"
              name="SKU"
              value={formData.SKU}
              onChange={handleChange}
              required
            />
            {errors?.SKU && <div className="errorMsg">{errors?.SKU}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Categories")}
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
            {errors?.category && <div className="errorMsg">{errors?.category}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Subcategory")}
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
            {errors?.subcategory && <div className="errorMsg">{errors?.subcategory}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Product Price")}
            </Label>
            <Input
              id="validationCustom03"
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
            {errors?.price && <div className="errorMsg">{errors?.price}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Compatibility")}
            </Label>
            <Input
              id="validationCustom04"
              type="text"
              name="compatibility"
              value={formData.compatibility}
              onChange={handleChange}
              required
            />
            {errors?.compatibility && <div className="errorMsg">{errors?.compatibility}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Discount")}
            </Label>
            <Input
              id="validationCustom05"
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
            />
            {errors?.discount && <div className="errorMsg">{errors?.discount}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.File Format")}
            </Label>
            <Input
              id="validationCustom06"
              type="text"
              name="fileFormat"
              value={formData.fileFormat}
              onChange={handleChange}
              required
            />
            {errors?.fileFormat && <div className="errorMsg">{errors?.fileFormat}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.File Size")}
            </Label>
            <Input
              id="validationCustom07"
              type="text"
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
              required
            />
            {errors?.fileSize && <div className="errorMsg">{errors?.fileSize}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.License Type")}
            </Label>
            <Input
              id="validationCustom08"
              type="text"
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              required
            />
            {errors?.licenseType && <div className="errorMsg">{errors?.licenseType}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Tags")}
            </Label>
            <Input
              id="validationCustom09"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              required
            />
            {errors?.tags && <div className="errorMsg">{errors?.tags}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Version")}
            </Label>
            <Input
              id="validationCustom10"
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              required
            />
            {errors?.version && <div className="errorMsg">{errors?.version}</div>}
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">
              <span>*</span> {t("digital.add_product.Status")}
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
            {errors?.status && <div className="errorMsg">{errors?.status}</div>}
          </FormGroup>
        </div>
      </CardBody>
    </Card>
  );
};

export default GeneralForm;
