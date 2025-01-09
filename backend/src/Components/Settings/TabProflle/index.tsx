import { Settings, User } from "react-feather";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import DeactivateAccount from "./DeactivateAccount";
import DeleteAccount from "./DeleteAccount";
import Notifications from "./Notifications";
import TabTable from "./TabTable";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const TabProfile = ({ getUser }) => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <div>
      <Tabs>
        <TabList className="nav nav-tabs tab-coupon">
          <Tab className="nav-link">
            <User className="me-2" />
            {t("settings.profile")}
          </Tab>
          <Tab className="nav-link">
            <Settings className="me-2" />
            {t("settings.contact")}
          </Tab>
        </TabList>
        <TabPanel>
          <TabTable userData={getUser} />
        </TabPanel>
        <TabPanel>
          <Notifications />
          <DeactivateAccount />
          <DeleteAccount />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default TabProfile;
