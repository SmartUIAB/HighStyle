import { useEffect, useState } from "react";
import { Col, Input, Row } from "reactstrap";
import { toast } from "react-toastify";

interface FormData {
  product_images: (string | File | null)[];
  deleteImages: string[];
}

interface ProductImagesProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: any
}

const ProductImages: React.FC<ProductImagesProps> = ({ formData, setFormData, errors }) => {
  const [dummyImages, setDummyImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const maxImages = 5;

  useEffect(() => {
    const processedImages = formData.product_images.map((image, index) => {
      if (typeof image === "string") {
        return image.startsWith('http') ? image : process.env.NEXT_PUBLIC_API_URL + image;
      }
      return image instanceof File ? URL.createObjectURL(image) : null;
    });

    while (processedImages.length < maxImages) {
      processedImages.push(null);
    }

    setDummyImages(processedImages.slice(0, maxImages));

    const firstValidImage = processedImages.find(img => img !== null);
    setMainPreview(firstValidImage || null);

    return () => {
      processedImages.forEach(img => {
        if (img && img.startsWith('blob:')) {
          URL.revokeObjectURL(img);
        }
      });
    };
  }, [formData.product_images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please upload a valid image file.');
        return;
      }

      const updatedProductImages = [...formData.product_images];

      const replacedImage = updatedProductImages[i];
      const updatedFormData = { ...formData };

      if (typeof replacedImage === 'string') {
        updatedFormData.deleteImages = [
          ...(formData.deleteImages || []),
          replacedImage
        ];
      }

      updatedProductImages[i] = selectedFile;
      updatedFormData.product_images = updatedProductImages;

      setFormData(updatedFormData);
    }
  };

  const handleDelete = (i: number) => {
    const updatedFormData = { ...formData };
    const updatedProductImages = [...formData.product_images];
    const deletedImage = updatedProductImages[i];

    if (typeof deletedImage === 'string') {
      updatedFormData.deleteImages = [
        ...(formData.deleteImages || []),
        deletedImage
      ];
    }

    updatedProductImages[i] = null;
    updatedFormData.product_images = updatedProductImages;

    setFormData(updatedFormData);
  };

  return (
    <Col xl="5">
      <div className="add-product">
        <Row>
          <Col xl="9" className="xl-50" sm="6" xs="9">
            <div className="add-product-image">
              <img
                src={mainPreview || "placeholder-image-url.jpg"}
                alt="Main Preview"
                className="img-fluid image_zoom_1 blur-up lazyloaded"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          </Col>
          <Col xl="3" className="xl-50" xs="3" sm="6">
            <ul className="file-upload-product">
              {dummyImages.map((res, i) => (
                <li key={i} style={{ position: "relative", marginBottom: '10px' }}>
                  <div className="box-input-file">
                    {res ? (
                      <>
                        <img
                          alt={`Preview ${i}`}
                          src={res}
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                          onClick={() => setMainPreview(res)}
                        />
                        <button
                          onClick={() => handleDelete(i)}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            cursor: "pointer",
                            zIndex: 10
                          }}
                        >
                          ✖
                        </button>
                        <label
                          htmlFor={`replace-${i}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            backgroundColor: "blue",
                            color: "white",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10
                          }}
                        >
                          ↻
                        </label>
                        <Input
                          id={`replace-${i}`}
                          className="upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, i)}
                          style={{ display: "none" }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          backgroundColor: "#eaeaea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => document.getElementById(`replace-${i}`)?.click()}
                      >
                        <span>+</span>
                      </div>
                    )}
                    <Input
                      id={`replace-${i}`}
                      className="upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, i)}
                      style={{ display: "none" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Col>
          {errors?.product_images && (
            <p style={{ color: "red", marginTop: "5px" }}>
              {errors?.product_images}
            </p>
          )}
        </Row>
      </div>
    </Col>
  );
};

export default ProductImages;