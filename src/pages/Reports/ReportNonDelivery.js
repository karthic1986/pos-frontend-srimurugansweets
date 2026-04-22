import React, { Component } from "react";
import MainHeader from "../../components/MainHeader";
import MainSidebar from "../../components/MainSidebar";
import MainFooter from "../../components/MainFooter";
import ReportNonDeliveryContent from "../../components/PageContent/Report/ReportNonDeliveryContent";

class ReportNonDelivery extends Component {
  render() {
    return (
      <>
        <MainHeader />
        <MainSidebar />
        <ReportNonDeliveryContent />
        <MainFooter />
      </>
    );
  }
}

export default ReportNonDelivery;
