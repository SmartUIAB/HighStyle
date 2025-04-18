import { Button, Col, Input, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const DeactivateAccount = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div className="account-setting deactivate-account">
      <h5 className="f-w-600 f-16">{t("settings.deleteAccount")}</h5>
      <Row>
        <Col>
          <Label className="d-block form-label">
            <Input className="radio_animated" id="edo-ani" type="radio" name="rdo-ani" defaultChecked />{t("settings.deactivateReasons.privacyConcern")}
          </Label>
          <Label className="d-block form-label">
            <Input className="radio_animated" id="edo-ani1" type="radio" name="rdo-ani" />
            {t("settings.deactivateReasons.temporary")}
          </Label>
          <Label className="d-block mb-0">
            <Input className="radio_animated" id="edo-ani2" type="radio" name="rdo-ani" defaultChecked />
            {t("settings.deactivateReasons.other")}
          </Label>
        </Col>
      </Row>
      <Button type="button" color="primary">
        {t("settings.deactivateAccount")}
      </Button>
    </div>
  );
};

export default DeactivateAccount;
