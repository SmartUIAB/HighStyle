import { Col, Input, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const Notifications = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div className="account-setting">
      <h5 className="f-w-600 f-16">{t("settings.notifications")}</h5>
      <Row>
        <Col>
          <Label className="d-block form-label">
            <Input className="checkbox_animated" id="chk-ani" type="checkbox" defaultChecked />
            {t("settings.desktopNotifications")}
          </Label>
          <Label className="d-block form-label">
            <Input className="checkbox_animated" id="chk-ani1" type="checkbox" />
            {t("settings.enableNotifications")}
          </Label>
          <Label className="d-block form-label">
            <Input className="checkbox_animated" id="chk-ani2" type="checkbox" />
            {t("settings.ownActivityNotifications")}
          </Label>
          <Label className="d-block mb-0">
            <Input className="checkbox_animated" id="chk-ani3" type="checkbox" defaultChecked />
            {t("settings.dnd")}
          </Label>
        </Col>
      </Row>
    </div>
  );
};

export default Notifications;
