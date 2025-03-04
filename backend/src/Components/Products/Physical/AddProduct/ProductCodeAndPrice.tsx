import { GET_ALL_CATEGORY, GET_ALL_SUBCATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { useQuery } from "@apollo/client";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

interface FormData {
  product_name: string;
  product_price: number;
  product_sku: string;
  product_category: string;
  product_color: string;
  product_discount: string;
  product_meta_title: string;
  product_meta_description: string;
  product_status: string;
  product_tags: string;
  product_subcategory: string;
}

interface ProductCodeAndPriceProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: { [key: string]: string };
}

const ProductCodeAndPrice: React.FC<ProductCodeAndPriceProps> = ({ formData, setFormData, errors }) => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { data: allCategoriesData } = useQuery(GET_ALL_CATEGORY);
  const { data: allSubCategoriesData } = useQuery(GET_ALL_SUBCATEGORY);

  return (
    <Form className="form-label-center">
      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.productName")} :</Label>
          </Col>
          <Col xl="8" sm="7">
            <Input
              name="product_name"
              id="validationCustom01"
              type="text"
              required
              value={formData.product_name}
              onChange={handleChange}
            />
            {errors?.product_name && <div className="errorMsg">{errors?.product_name}</div>}
          </Col>
        </Row>
        <div className="valid-feedback">Looks good!</div>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.price")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              className="mb-0"
              name="product_price"
              id="validationCustom02"
              type="number"
              required
              value={formData.product_price}
              onChange={handleChange}
            />
            {errors?.product_price && <div className="errorMsg">{errors?.product_price}</div>}
          </Col>
          <div className="valid-feedback">Looks good!</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.sku")}:</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_sku"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_sku}
              onChange={handleChange}
            />
            {errors?.product_sku && <div className="errorMsg">{errors?.product_sku}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.color")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_color"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_color}
              onChange={handleChange}
            />
            {errors?.product_color && <div className="errorMsg">{errors?.product_color}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.discount")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_discount"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_discount}
              onChange={handleChange}
            />
            {errors?.product_discount && <div className="errorMsg">{errors?.product_discount}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.metaTitle")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_meta_title"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_meta_title}
              onChange={handleChange}
            />
            {errors?.product_meta_title && <div className="errorMsg">{errors?.product_meta_title}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.metaDescription")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_meta_description"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_meta_description}
              onChange={handleChange}
            />
            {errors?.product_meta_description && <div className="errorMsg">{errors?.product_meta_description}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.productTags")} :</Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              name="product_tags"
              id="validationCustomUsername"
              type="text"
              required
              value={formData.product_tags}
              onChange={handleChange}
            />
            {errors?.product_tags && <div className="errorMsg">{errors?.product_tags}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" sm="4">
            <Label htmlFor="category" className="fw-bold mb-0">
              {t("physical.addProduct.category")} :
            </Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              id="category"
              type="select"
              name="product_category"
              value={formData.product_category || ""}
              onChange={handleChange}
            >
              <option value="" disabled>
                {t("physical.addProduct.selectCategory")}
              </option>
              {allCategoriesData?.categorieslist
                ?.filter((item: any) => item.type === "Physical")
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Input>
            {errors?.product_category && <div className="errorMsg">{errors?.product_category}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" sm="4">
            <Label htmlFor="category" className="fw-bold mb-0">
              {t("physical.addProduct.subCategory")}
            </Label>
          </Col>
          <Col sm="7" xl="8">
            <Input
              id="category"
              type="select"
              name="product_subcategory"
              value={formData.product_subcategory || ""}
              onChange={handleChange}
            >
              <option value="" disabled>
                {t("physical.addProduct.selectSubCategory")}
              </option>
              {allSubCategoriesData?.subcategorieslist
                ?.filter((item: any) => (item.type === "Physical" && item.category.id === formData.product_category))
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Input>
            {errors?.product_subcategory && <div className="errorMsg">{errors?.product_subcategory}</div>}
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.selectStatus")} :</Label>
          </Col>
          <Col xl="8" sm="7">
            <Input
              id="exampleFormControlSelect1"
              type="select"
              name="product_status"
              onChange={handleChange}
              value={formData.product_status}
            >
              <option value="" disabled>{t("physical.addProduct.selectStatus")}</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </Input>
            {errors?.product_status && <div className="errorMsg">{errors?.product_status}</div>}
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default ProductCodeAndPrice;