import React, { Component } from "react";
import MainHeader from '../../components/MainHeader';
import MainSidebar from '../../components/MainSidebar';
import MainFooter from '../../components/MainFooter';
import ReportByCustomerContent from "../../components/PageContent/Report/ReportByCustomerContent";

class ReportByCustomer extends Component {


  render() {
    return (
      <>
        <MainHeader />
        <MainSidebar />
        <ReportByCustomerContent />
        <MainFooter />
      </>
    );
  };
};

export default ReportByCustomer;