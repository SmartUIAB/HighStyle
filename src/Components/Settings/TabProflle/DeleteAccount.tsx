import { Button, Col, Input, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const DeleteAccount = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div className="account-setting deactivate-account">
      <h5 className="f-w-600 f-16">{t("settings.deactivateAccount")}</h5>
      <Row>
        <Col>
          <Label className="d-block form-label">
            <Input className="radio_animated" id="edo-ani3" type="radio" name="rdo-ani1" defaultChecked />
            {t("settings.deleteReasons.noLongerUsable")}
          </Label>
          <Label className="d-block form-label">
            <Input className="radio_animated" id="edo-ani4" type="radio" name="rdo-ani1" />
            {t("settings.deleteReasons.switchAccount")}
          </Label>
          <Label className="d-block mb-0">
            <Input className="radio_animated" id="edo-ani5" type="radio" name="rdo-ani1" defaultChecked />
            {t("settings.deleteReasons.other")}
          </Label>
        </Col>
      </Row>
      <Button type="button" color="primary">
        {t("settings.deleteAccount")}
      </Button>
    </div>
  );
};

export default DeleteAccount;
