import { useState } from "react";
import { Col, Input, Row } from "reactstrap";

interface FormData {
  product_images: File[];
}

interface ProductImagesProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const ProductImages: React.FC<ProductImagesProps> = ({ formData, setFormData }) => {
  const [dummyImages, setDummyImages] = useState<(string | null)[]>([null, null, null, null, null, null]);

  const [filesData, setFilesData] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      setFilesData((prev) => [...prev, selectedFile]);

      const reader = new FileReader();
      reader.onload = () => {
        const updatedDummyImages = [...dummyImages];
        updatedDummyImages[i] = reader.result as string;

        const updatedFormData = { ...formData };
        updatedFormData.product_images = filesData;
        setFormData(updatedFormData);

        setDummyImages(updatedDummyImages);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <Col xl="5">
      <div className="add-product">
        <Row>
          <Col xl="9" className="xl-50" sm="6" xs="9">
            <div className="add-product-image">
              <img
                src={dummyImages[0] || "placeholder-image-url.jpg"}
                alt="Main Preview"
                className="img-fluid image_zoom_1 blur-up lazyloaded"
              />
            </div>
          </Col>
          <Col xl="3" className="xl-50" xs="3" sm="6">
            <ul className="file-upload-product">
              {dummyImages.map((res, i) => (
                <li key={i}>
                  <div className="box-input-file">
                    <Input
                      className="upload"
                      type="file"
                      onChange={(e) => handleFileChange(e, i)}
                    />
                    {res ? (
                      <img
                        alt={`Preview ${i}`}
                        src={res}
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          backgroundColor: "#eaeaea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        No Image
                      </div>
                    )}
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