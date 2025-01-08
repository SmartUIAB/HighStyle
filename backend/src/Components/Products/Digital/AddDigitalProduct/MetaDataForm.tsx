//@ts-nocheck
import { useTranslation } from "@/app/i18n/client";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useAppSelector } from "@/Redux/Hooks";
import { Button, Card, CardBody, FormGroup, Input, Label } from "reactstrap";

const MetaDataForm = ({ formData, setFormData }) => {
  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  return (
    <Card>
      <CommonCardHeader title="Meta Data" />
      <CardBody>
        <div className="digital-add needs-validation">
          <FormGroup>
            <Label className="col-form-label pt-0">{t('digital.add_product.Meta Title')}</Label>
            <Input
              id="metaTitle"
              type="text"
              value={formData.metaTitle}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label">{t('digital.add_product.Meta Description')} </Label>
            <textarea
              id="metaDescription"
              rows={4}
              cols={12}
              value={formData.metaDescription}
              onChange={handleChange}
            ></textarea>
          </FormGroup>
        </div>
      </CardBody>
    </Card>
  );
};

export default MetaDataForm;
