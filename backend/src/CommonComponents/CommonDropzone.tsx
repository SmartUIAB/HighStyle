//@ts-nocheck
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone-uploader";

const MyUploader = ({ formData, setFormData }) => {
  const [display, setDisplay] = useState(false);

  useEffect(() => { }, [display]);

  const getUploadParams = () => {
    setDisplay(!display);
    return { url: "https://httpbin.org/post" };
  };

  return (
    <div className="dropzone">
      <Dropzone
        getUploadParams={getUploadParams}
        onChangeStatus={(fileWithMeta, status) => {
          if (status === 'done') {
            const file = fileWithMeta.file;
            console.log(file);

            setFormData((prevData) => ({
              ...prevData,
              images: [...prevData.images, file],
            }));
          }
        }}
        styles={{ dropzone: { minHeight: 300, maxHeight: 300 } }}
      />
    </div>
  );
};

export default MyUploader;
