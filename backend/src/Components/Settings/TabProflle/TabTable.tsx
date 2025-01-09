import { Table } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const TabTable = ({ userData }) => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div className="tab-pane fade show active">
      <h5 className="f-w-600 f-16">{t("settings.profile")}</h5>
      <div className="table-responsive profile-table">
        <Table className="table-responsive">
          <tbody>
            <tr>
              <td>{t("settings.firstName")}:</td>
              <td>{userData?.me.firstname}</td>
            </tr>
            <tr>
              <td>{t("settings.lastName")}:</td>
              <td>{userData?.me.lastname}</td>
            </tr>
            <tr>
              <td>{t("settings.email")}:</td>
              <td>{userData?.me.email}</td>
            </tr>
            <tr>
              <td>{t("settings.company")}:</td>
              <td>{userData?.me?.company?.name}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default TabTable;
