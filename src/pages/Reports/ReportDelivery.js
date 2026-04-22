import React, { Component } from "react";
import MainHeader from '../../components/MainHeader';
import MainSidebar from '../../components/MainSidebar';
import MainFooter from '../../components/MainFooter';
import ReportDeliveryContent from "../../components/PageContent/Report/ReportDeliveryContent";

class ReportDelivery extends Component {


  render() {
    return (
      <>
        <MainHeader />
        <MainSidebar />
        <ReportDeliveryContent />
        <MainFooter />
      </>
    );
  };
};

export default ReportDelivery;