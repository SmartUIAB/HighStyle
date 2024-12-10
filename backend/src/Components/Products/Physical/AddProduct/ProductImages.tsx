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
}

const ProductImages: React.FC<ProductImagesProps> = ({ formData, setFormData }) => {
  const [dummyImages, setDummyImages] = useState<(string | null)[]>([null, null, null, null, null]);
  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const apiBaseUrl = "http://localhost:2024";
  const maxImages = 5;

  useEffect(() => {
    // Process images for display
    const processedImages = formData.product_images.map((image, index) => {
      if (typeof image === "string") {
        return image.startsWith('http') ? image : apiBaseUrl + image;
      }
      return image instanceof File ? URL.createObjectURL(image) : null;
    });

    // Fill the rest with null if needed
    while (processedImages.length < maxImages) {
      processedImages.push(null);
    }

    // Update dummy images
    setDummyImages(processedImages.slice(0, maxImages));

    // Set main preview to the first non-null image
    const firstValidImage = processedImages.find(img => img !== null);
    setMainPreview(firstValidImage || null);

    // Clean up object URLs
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

      // Validate file type and size if needed
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please upload a valid image file.');
        return;
      }

      // Create a copy of the current product images
      const updatedProductImages = [...formData.product_images];

      // Track the image being replaced for deletion
      const replacedImage = updatedProductImages[i];
      const updatedFormData = { ...formData };

      // If replacing an existing string (URL) image, add to deleteImages
      if (typeof replacedImage === 'string') {
        updatedFormData.deleteImages = [
          ...(formData.deleteImages || []),
          replacedImage
        ];
      }

      // Replace the image at the specific index
      updatedProductImages[i] = selectedFile;
      updatedFormData.product_images = updatedProductImages;

      // Update form data
      setFormData(updatedFormData);
    }
  };

  const handleDelete = (i: number) => {
    const updatedFormData = { ...formData };
    const updatedProductImages = [...formData.product_images];
    const deletedImage = updatedProductImages[i];

    // If deleting a string (URL) image, add to deleteImages
    if (typeof deletedImage === 'string') {
      updatedFormData.deleteImages = [
        ...(formData.deleteImages || []),
        deletedImage
      ];
    }

    // Set the image slot to null
    updatedProductImages[i] = null;
    updatedFormData.product_images = updatedProductImages;

    // Update the form data
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
                        {/* Delete Button */}
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
                        {/* Replace Button */}
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
                    {/* Hidden file input */}
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
        </Row>
      </div>
    </Col>
  );
};

export default ProductImages;