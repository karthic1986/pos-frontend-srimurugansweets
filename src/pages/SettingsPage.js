import React from "react";
import MainHeader from "../components/MainHeader";
import MainSidebar from "../components/MainSidebar";
import MainFooter from "../components/MainFooter";
import SettingsPageContent from "../components/PageContent/SettingsPageContent";

const SettingsPage = () => {
  return (
    <div>
      <MainHeader />
      <MainSidebar />
      <SettingsPageContent />
      <MainFooter />
    </div>
  );
};

export default SettingsPage;
