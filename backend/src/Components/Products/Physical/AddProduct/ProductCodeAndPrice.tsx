import { GET_ALL_CATEGORY, GET_ALL_SUBCATEGORY } from "@/GraphQL/Queries/categoryQueries";
import { useQuery } from "@apollo/client";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

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
}

const ProductCodeAndPrice: React.FC<ProductCodeAndPriceProps> = ({ formData, setFormData }) => {
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
            <Label className="fw-bold mb-0">Product Name :</Label>
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
          </Col>
        </Row>
        <div className="valid-feedback">Looks good!</div>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Price :</Label>
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
          </Col>
          <div className="valid-feedback">Looks good!</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">SKU :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Color :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Discount :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Meta Title :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Meta Description :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Product Tags :</Label>
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
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" sm="4">
            <Label htmlFor="category" className="fw-bold mb-0">
              Category:
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
                Select category
              </option>
              {allCategoriesData?.categorieslist
                ?.filter((item: any) => item.type === "Physical")
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Input>
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" sm="4">
            <Label htmlFor="category" className="fw-bold mb-0">
              Sub Category:
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
                Select Sub category
              </option>
              {allSubCategoriesData?.subcategorieslist
                ?.filter((item: any) => (item.type === "Physical" && item.category.id === formData.product_category))
                .map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </Input>
          </Col>
          <div className="invalid-feedback offset-sm-4 offset-xl-3">Please choose Valid Code.</div>
        </Row>
      </FormGroup>

      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">Select Status :</Label>
          </Col>
          <Col xl="8" sm="7">
            <Input
              id="exampleFormControlSelect1"
              type="select"
              name="product_status"
              onChange={handleChange}
              value={formData.product_status}
            >
              <option value="" disabled>Select Status</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </Input>
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default ProductCodeAndPrice;