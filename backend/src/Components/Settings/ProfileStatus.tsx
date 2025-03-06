import { Media, Progress } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";


const ProfileStatus = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div className="project-status">
      <h5 className="f-w-600 f-16">{t("settings.employeeStatus")}</h5>
      <Media>
        <Media body>
          <h6>
            {t("settings.performance")} <span className="pull-right">80%</span>
          </h6>
          <Progress color="primary" value={80} className="sm-progress-bar" />
        </Media>
      </Media>
      <Media>
        <Media body>
          <h6>
            {t("settings.overtime")} <span className="pull-right">60%</span>
          </h6>
          <Progress value={60} color="secondary" className=" sm-progress-bar" />
        </Media>
      </Media>
      <Media>
        <Media body>
          <h6>
            {t("settings.leavesTaken")} <span className="pull-right">50%</span>
          </h6>
          <Progress value={50} color="danger" className="sm-progress-bar" />
        </Media>
      </Media>
    </div>
  );
};

export default ProfileStatus;
