//@ts-nocheck
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PHYSICAL_PRODUCT, UPDATE_PHYSICAL_PRODUCT } from "../../../../GraphQL/Mutations/productMutation";
import { PHYSICAL_PRODUCT_BY_ID } from "@/GraphQL/Queries/productQueries";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Button, Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import ProductCodePrice from "./ProductCodeAndPrice";
import ProductImages from "./ProductImages";
import ProductSizeAndDescription from "./ProductSizeAndDescription";
import TotalProducts from "./TotalProducts";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { physicalproductSchema } from "@/utils/validation";

const AddProduct = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const { data: physicalProductByID, loading, refetch, error } = useQuery(PHYSICAL_PRODUCT_BY_ID, {
    variables: { physicalProductId: id },
    skip: !id,
  });

  const initialFormState = {
    product_name: "",
    product_description: "",
    product_price: "",
    product_sku: "",
    product_size: "",
    product_images: [],
    product_category: "",
    product_color: "",
    product_discount: "",
    product_meta_title: "",
    product_meta_description: "",
    product_status: "",
    product_stockquantity: "",
    product_tags: "",
    product_subcategory: "",
    deleteImages: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (physicalProductByID?.physicalProduct && isHydrated) {
      const product = physicalProductByID.physicalProduct;
      setFormData({
        product_name: product.title || "",
        product_description: product.description || "",
        product_price: product.price?.toString() || "",
        product_sku: product.SKU || "",
        product_size: product.sizes.join(", ") || "",
        product_images: product.images || "",
        product_category: product.category?.id || "",
        product_color: product.colors.join(", ") || "",
        product_discount: product.discount?.toString() || "",
        product_meta_title: product.metaTitle || "",
        product_meta_description: product.metaDescription || "",
        product_status: product.status || "",
        product_stockquantity: product.stockQuantity || 0,
        product_tags: product.tags.join(", ") || "",
        product_subcategory: product.subcategory?.id || "",
        deleteImages: []
      });
    } else if (!id) {
      setFormData(initialFormState);
    }
  }, [physicalProductByID, isHydrated, id]);

  const [createPhysicalProduct] = useMutation(CREATE_PHYSICAL_PRODUCT);
  const [updatePhysicalProduct] = useMutation(UPDATE_PHYSICAL_PRODUCT);

  const handleValidSubmit = async () => {
    setErrors({});
    try {
      await physicalproductSchema.validate(formData, { abortEarly: false });
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
        return;
      }
    }
    try {
      const input = {
        SKU: formData.product_sku?.trim() || "",
        category: formData.product_category?.trim() || "",
        colors: (formData.product_color || "").split(",").map(color => color.trim()).filter(Boolean),
        description: formData.product_description?.trim() || "",
        discount: parseFloat(formData.product_discount) || 0,
        metaDescription: formData.product_meta_description?.trim() || "",
        metaTitle: formData.product_meta_title?.trim() || "",
        price: parseFloat(formData.product_price) || 0,
        sizes: (formData.product_size || "").split(",").map(size => size.trim()).filter(Boolean),
        status: formData.product_status?.trim() || "inactive",
        stockQuantity: parseInt(formData.product_stockquantity) || 0,
        subcategory: formData.product_subcategory?.trim() || "",
        tags: (formData.product_tags || "").split(",").map(tag => tag.trim()).filter(Boolean),
        title: formData.product_name?.trim() || "",
      };

      if (id) {
        const { data } = await updatePhysicalProduct({
          variables: {
            updatePhysicalProductId: id,
            input,
            images: formData.product_images.filter(image => image instanceof File),
            deleteImages: formData.deleteImages,
          },
        });

        if (data) {
          toast.success("Product updated successfully.");
          refetch()
        }
      } else {
        const { data } = await createPhysicalProduct({
          variables: {
            input,
            images: formData.product_images,
          },
        });

        if (data) {
          toast.success("Product created successfully.");
          setFormData(initialFormState);
          refetch()
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner style={{ color: "#ff8084" }} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }


  return (
    <Fragment>
      <CommonBreadcrumb title={id ? t("modalTitle.editProduct") : t("modalTitle.addProduct")} parent={t("type.physical")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={id ? t("modalTitle.editProduct") : t("modalTitle.addProduct")} />
              <CardBody>
                <Row className="product-adding">
                  <ProductImages formData={formData} setFormData={setFormData} errors={errors} />
                  <Col xl="7">
                    <div className="needs-validation add-product-form">
                      <ProductCodePrice formData={formData} setFormData={setFormData} errors={errors} />
                      <TotalProducts formData={formData} setFormData={setFormData} errors={errors} />
                      <ProductSizeAndDescription formData={formData} setFormData={setFormData} errors={errors} />
                      <div className="offset-xl-3 offset-sm-4">
                        <Button type="submit" onClick={handleValidSubmit} color="primary">
                          {id ? t("physical.addProduct.edit") : t("physical.addProduct.add")}
                        </Button>
                        <Button type="button" color="light" onClick={() => setFormData(initialFormState)}>
                          {t("physical.addProduct.discard")}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default AddProduct;
