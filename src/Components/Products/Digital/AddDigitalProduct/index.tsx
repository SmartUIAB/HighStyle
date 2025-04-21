//@ts-nocheck
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { Fragment, useEffect, useState } from "react";
import { Button, Col, Container, Row, Spinner } from "reactstrap";
import GeneralForm from "./GeneralForm";
import MetaDataForm from "./MetaDataForm";
import DescriptionForm from "./DescriptionForm";
import MyUploader from "@/CommonComponents/CommonDropzone";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_DIGITAL_PRODUCT, UPDATE_DIGITAL_PRODUCT } from "../../../../GraphQL/Mutations/productMutation";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { DIGITAL_PRODUCT_BY_ID } from "@/GraphQL/Queries/productQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { digitalproductSchema } from "@/utils/validation";

const AddDigitalProduct = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Ensure `useQuery` is not conditionally rendered
  const { data: digitalProductByID, loading, error, refetch } = useQuery(DIGITAL_PRODUCT_BY_ID, {
    variables: { digitalProductId: id },
    skip: !id,
  });

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const [createDigitalProduct] = useMutation(CREATE_DIGITAL_PRODUCT)
  const [updateDigitalProduct] = useMutation(UPDATE_DIGITAL_PRODUCT);

  // Default form data, ensuring it's not conditionally set
  const [formData, setFormData] = useState({
    title: "",
    SKU: "",
    category: "",
    compatibility: "",
    description: "",
    price: "",
    discount: "",
    status: "",
    metaTitle: "",
    metaDescription: "",
    fileFormat: "",
    fileSize: "",
    licenseType: "",
    subcategory: "",
    tags: "",
    version: "",
    images: [],
    deleteImages: []
  });

  // UseEffect for form data population
  useEffect(() => {
    if (digitalProductByID?.digitalProduct) {
      const product = digitalProductByID.digitalProduct;
      setFormData({
        title: product.title || "",
        SKU: product.SKU || "",
        category: product.category.id || "",
        compatibility: product.compatibility.join(", ") || "",
        description: product.description || "",
        price: product.price.toString() || "",
        discount: product.discount.toString() || "",
        status: product.status || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        fileFormat: product.fileFormat || "",
        fileSize: product.fileSize || "",
        licenseType: product.licenseType || "",
        subcategory: product.subcategory.id || "",
        tags: product.tags.join(", ") || "",
        version: product.version || "",
        images: product.images || [],
        deleteImages: []
      });
    } else if (!id) {
      setFormData({
        title: "",
        SKU: "",
        category: "",
        compatibility: "",
        description: "",
        price: "",
        discount: "",
        status: "",
        metaTitle: "",
        metaDescription: "",
        fileFormat: "",
        fileSize: "",
        licenseType: "",
        subcategory: "",
        tags: "",
        version: "",
        images: [],
        deleteImages: []
      });
    }
  }, [digitalProductByID, id]);

  // Handle submission
  const handleValidSubmit = async () => {
    setErrors({});
    try {
      await digitalproductSchema.validate(formData, { abortEarly: false });
    } catch (error) {
      if (error.inner) {
        const validationErrors: { [key: string]: string } = error.inner.reduce(
          (acc: any, error: any) => {
            acc[error.path] = error.message;
            return acc;
          },
          {}
        );
        console.log(validationErrors)
        setErrors(validationErrors)
        return;
      }
    }
    try {
      if (id) {
        const { data } = await updateDigitalProduct({
          variables: {
            updateDigitalProductId: id,
            input: {
              SKU: formData.SKU,
              category: formData.category,
              compatibility: formData.compatibility.split(","),
              description: formData.description,
              discount: parseFloat(formData.discount),
              fileFormat: formData.fileFormat,
              fileSize: formData.fileSize,
              licenseType: formData.licenseType,
              metaDescription: formData.metaDescription,
              metaTitle: formData.metaTitle,
              price: parseFloat(formData.price),
              status: formData.status,
              subcategory: formData.subcategory,
              tags: formData.tags.split(","),
              title: formData.title,
              version: formData.version,
            },
            images: formData.images.filter(image => image instanceof File),
            deleteImages: formData.deleteImages,
          },
        });

        if (data) {
          toast.success("Digital Product Updated Successfully");
          refetch();
        }
      } else {
        const { data } = await createDigitalProduct({
          variables: {
            input: {
              SKU: formData.SKU,
              category: formData.category,
              compatibility: formData.compatibility.split(","),
              description: formData.description,
              discount: parseFloat(formData.discount),
              fileFormat: formData.fileFormat,
              fileSize: formData.fileSize,
              licenseType: formData.licenseType,
              metaDescription: formData.metaDescription,
              metaTitle: formData.metaTitle,
              price: parseFloat(formData.price),
              status: formData.status,
              subcategory: formData.subcategory,
              tags: formData.tags.split(","),
              title: formData.title,
              version: formData.version,
            },
            images: formData.images,
          },
        });

        if (data) {
          toast.success("Digital Product Created Successfully");
          setFormData({
            title: "",
            SKU: "",
            category: "",
            compatibility: "",
            description: "",
            price: "",
            discount: "",
            status: "",
            metaTitle: "",
            metaDescription: "",
            fileFormat: "",
            fileSize: "",
            licenseType: "",
            subcategory: "",
            tags: "",
            version: "",
            images: [],
            deleteImages: []
          });
          refetch();
        }
      }
    } catch (error) {
      console.error("Error processing digital product:", error);
      toast.error("Failed to process digital product. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner style={{ color: "#ff8084" }} />
      </div>
    );

  if (error) return <div>Error: {error.message}</div>;



  return (
    <Fragment>
      <CommonBreadcrumb title={id ? t('digital.add_product.Edit Products') : t('digital.add_product.Add Products')} parent={t('digital.add_product.Digital')} />
      <Container fluid>
        <Row className="product-adding">
          <Col xl="6">
            <GeneralForm formData={formData} setFormData={setFormData} errors={errors} />
          </Col>
          <Col xl="6">
            <MyUploader formData={formData} setFormData={setFormData} />
            <DescriptionForm formData={formData} setFormData={setFormData} errors={errors} />
            <MetaDataForm formData={formData} setFormData={setFormData} errors={errors} />
            <div className="offset-xl-3 offset-sm-4 mt-3 d-flex gap-2">
              <Button type="submit" onClick={handleValidSubmit} color="primary">
                {id ? t('digital.add_product.Update') : t('digital.add_product.Add')}
              </Button>
              <Button color="light">{t('digital.add_product.Discard')}</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};


export default AddDigitalProduct;
