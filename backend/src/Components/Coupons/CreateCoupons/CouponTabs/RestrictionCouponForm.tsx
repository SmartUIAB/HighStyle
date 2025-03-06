//@ts-nocheck
import { useTranslation } from "@/app/i18n/client";
import { GET_DIGITAL_PRODUCT, GET_PHYSICAL_PRODUCT } from "@/GraphQL/Queries/productQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

interface Product {
  id: string;
  title: string;
}

interface FormData {
  restrictionProducts: string[];
  minSpend: number | string;
  maxSpend: number | string;
}

interface RestrictionFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const RestrictionForm: React.FC<RestrictionFormProps> = ({ formData, setFormData,errors }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { data: allPhysicalProductData } = useQuery(GET_PHYSICAL_PRODUCT);
  const { data: allDigitalProductData } = useQuery(GET_DIGITAL_PRODUCT);

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [physicalProducts, digitalProducts] = await Promise.all([
          allPhysicalProductData?.physicalProducts?.products || [],
          allDigitalProductData?.digitalProducts?.products || [],
        ]);

        const formattedProducts: Product[] = [
          ...physicalProducts.map((product: any) => ({
            id: product.id,
            title: product.title,
          })),
          ...digitalProducts.map((product: any) => ({
            id: product.id,
            title: product.title,
          })),
        ];

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (allPhysicalProductData && allDigitalProductData) {
      fetchProducts();
    }
  }, [allPhysicalProductData, allDigitalProductData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, selectedOptions } = e.target;

    if (name === "restrictionProducts") {
      if (selectedOptions.length === 0) {
        setFormData((prevState) => ({
          ...prevState,
          restrictionProducts: [],
        }));
      } else {
        const selectedValues = Array.from(selectedOptions).map((option: any) => option.value);
        setFormData((prevState) => ({
          ...prevState,
          restrictionProducts: selectedValues,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleRemoveSelection = (id: string) => {
    setFormData((prevState) => ({
      ...prevState,
      restrictionProducts: prevState.restrictionProducts.filter((item) => item !== id),
    }));
  };

  return (
    <Form className="needs-validation" noValidate>
      <h4>{t("coupon.addcoupon.restriction")}</h4>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.products")}</Label>
          </Col>
          <Col md="7">
            <Input
              id="restrictionProducts"
              type="select"
              name="restrictionProducts"
              value={formData.restrictionProducts}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select products
              </option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </Input>
            {errors?.restrictionProducts && <div className="errorMsg">{errors?.restrictionProducts}</div>}
          </Col>

          <div style={{ marginTop: '10px' }}>
            {formData.restrictionProducts.length > 0 && (
              <div>
                <h5>{t("coupon.addcoupon.selected_products")}:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {formData.restrictionProducts.map((selectedId) => {
                    const selectedProduct = products.find((p) => p.id === selectedId);
                    return selectedProduct ? (
                      <div
                        key={selectedId}
                        style={{
                          margin: '5px',
                          padding: '5px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '15px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <span>{selectedProduct.title}</span>
                        <Button
                          color="danger"
                          size="sm"
                          style={{ marginLeft: '5px' }}
                          onClick={() => handleRemoveSelection(selectedId)}
                        >
                          x
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="valid-feedback">Please Provide a Product Name.</div>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.minimum_spend")}</Label>
          </Col>
          <Col md="7">
            <Input
              id="minSpend"
              type="number"
              name="minSpend"
              value={formData.minSpend || ""}
              onChange={handleInputChange}
            />
            {errors?.minSpend && <div className="errorMsg">{errors?.minSpend}</div>}
          </Col>
        </Row>
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.maximum_spend")}</Label>
          </Col>
          <Col md="7">
            <Input
              id="maxSpend"
              type="number"
              name="maxSpend"
              value={formData.maxSpend || ""}
              onChange={handleInputChange}
            />
            {errors?.maxSpend && <div className="errorMsg">{errors?.maxSpend}</div>}
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default RestrictionForm;
