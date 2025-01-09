import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { useMutation, useQuery } from "@apollo/client";
import { Fragment, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { GET_MEDIA_LIST } from "../../GraphQL/Queries/mediaQueries";
import { DELETE_MEDIA, UPLOAD_MEDIA } from "../../GraphQL/Mutations/mediaMutations";
import { toast } from "react-toastify";
import MediaUploader from "./mediaUploader";
import { Trash2 } from "react-feather";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

interface Media {
  id: string;
  filePath: string;
  fileName: string;
}

interface GetAllImagesResponse {
  getAllImages: {
    images: Media[];
  };
}

interface FormData {
  images: (File | string)[];
  deleteImages: (File | string)[];
}

const Media: React.FC = () => {
  const [isDeleteId, setIsDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    images: [],
    deleteImages: [],
  });

  const { data: allMediaData, refetch, loading } = useQuery<GetAllImagesResponse>(GET_MEDIA_LIST, {
    variables: {
      page: 1,
      limit: 10,
    },
  });

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const [uploadMedia] = useMutation(UPLOAD_MEDIA);
  const [deleteMedia] = useMutation(DELETE_MEDIA);

  const handleDeleteMedia = async () => {
    try {
      const { data } = await deleteMedia({
        variables: { imageIds: isDeleteId },
      });
      if (data) {
        toast.success("Deleted Media successfully");
        setModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Error deleting Media:", error);
      toast.error("Failed to delete Media");
    }
  };

  const handleSave = async () => {
    try {
      if (formData.images.length > 0) {
        const { data } = await uploadMedia({
          variables: { images: formData.images },
        });
        if (data) {
          toast.success("Uploaded Media successfully");
          setFormData({ images: [], deleteImages: [] });
          refetch();
        }
      }
    } catch (error) {
      console.error("Error uploading Media:", error);
      toast.error("Failed to upload Media");
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <Fragment>
      <CommonBreadcrumb title={t("media.title")} parent={t("media.title")} />
      <Container fluid>
        <Card>
          <CardHeader>
            <h5>{t("media.dropzone_media")}</h5>
          </CardHeader>
          <CardBody>
            <MediaUploader formData={formData} setFormData={setFormData} />
            <div className="pull-right">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Spinner size="sm" color="light" /> : t("media.upload")}
              </Button>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h5>{t("media.media_file_list")}</h5>
          </CardHeader>
          <CardBody>
            <div
              id="batchDelete"
              className="category-table media-table coupon-list-delete"
            >
              <table
                className="table mt-5 w-full"
                style={{ minWidth: "1200px" }}
              >
                <thead>
                  <tr>
                    <th className="text-uppercase">{t("media.title")}</th>
                    <th className="text-uppercase">{t("media.file_name")}</th>
                    <th className="text-uppercase">{t("media.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {allMediaData?.getAllImages?.images?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        {t("media.no_data_found")}
                      </td>
                    </tr>
                  ) : (
                    allMediaData?.getAllImages?.images?.map((media, i) => (
                      <tr key={i}>
                        <td className="align-middle">
                          <img
                            src={
                              media.filePath !== ""
                                ? process.env.NEXT_PUBLIC_API_URL + media.filePath
                                : "/assets/images/download.png"
                            }
                            alt="no image"
                            style={{ width: "50px", height: "50px" }}
                          />
                        </td>
                        <td className="align-middle">{media.fileName}</td>
                        <td className="align-middle">
                          <Button
                            color="transparent"
                            className="p-1"
                            onClick={() => {
                              setIsDeleteId(media.id);
                              toggleModal();
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Container>
      <Modal
        isOpen={modalOpen}
        toggle={toggleModal}
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={toggleModal}>Confirm Deletion</ModalHeader>
        <ModalBody>Are you sure you want to delete this Media?</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleDeleteMedia}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default Media;
