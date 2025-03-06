//@ts-nocheck
import { useState } from "react";
import Dropzone from "react-dropzone-uploader";
import { toast } from "react-toastify";

const MyUploader = ({ formData, setFormData }) => {
  const maxImages = 5;

  const handlePreviewImages = () => {
    return formData.images.map((image, index) => {
      const imageUrl = image instanceof File ? URL.createObjectURL(image) : `${process.env.NEXT_PUBLIC_API_URL}${image}`;
      return (
        <div key={index} style={{ position: "relative", display: "inline-block", marginRight: 10 }}>
          <img
            src={imageUrl}
            alt={`Preview ${index}`}
            style={{ width: 100, height: 100 }}
          />
          <button
            onClick={() => handleReplaceImage(index)}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "blue",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ↻
          </button>
          <button
            onClick={() => handleDeleteImage(index)}
            style={{
              position: "absolute",
              top: 5,
              right: 35,
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>
      );
    });
  };

  const handleReplaceImage = (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const newFile = e.target.files[0];
      if (newFile) {
        const oldImage = formData.images[index];
        console.log("oldImage", oldImage)

        setFormData((prevData) => ({
          ...prevData,
          deleteImages: [...(prevData.deleteImages || []), oldImage],
          images: prevData.images.map((img, i) => (i === index ? newFile : img)),
        }));

        toast.success("Image replaced successfully!");
      }
    };
    fileInput.click();
  };

  const handleDeleteImage = (index) => {
    const imageToDelete = formData.images[index];
    console.log("imageToDelete", imageToDelete)
    setFormData((prevData) => ({
      ...prevData,
      deleteImages: [...(prevData.deleteImages || []), imageToDelete],
      images: prevData.images.filter((_, i) => i !== index),
    }));

    toast.info("Image deleted successfully!");
  };

  const handleUploadStatusChange = (fileWithMeta, status) => {
    if (status === "done") {
      const file = fileWithMeta.file;

      if (formData.images.length >= maxImages) {
        toast.error(`You can only upload up to ${maxImages} images.`);
      } else {
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, file],
        }));
      }
    }
  };

  return (
    <div className="dropzone">
      <Dropzone
        getUploadParams={() => ({ url: "https://httpbin.org/post" })}
        onChangeStatus={handleUploadStatusChange}
        styles={{
          previewImage: { display: "none" },
        }}
      />
      <div className="image-preview-container">
        {formData.images.length > 0 && handlePreviewImages()}
      </div>
    </div>
  );
};

export default MyUploader;
