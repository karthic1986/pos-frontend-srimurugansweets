import React, { Component } from "react";
import MainHeader from '../../components/MainHeader';
import MainSidebar from '../../components/MainSidebar';
import MainFooter from '../../components/MainFooter';
import ReportByProductContent from "../../components/PageContent/Report/ReportByProductContent";

class ReportByProduct extends Component {


  render() {
    return (
      <>
        <MainHeader />
        <MainSidebar />
        <ReportByProductContent />
        <MainFooter />
      </>
    );
  };
};

export default ReportByProduct;