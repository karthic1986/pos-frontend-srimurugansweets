import React, { Component } from "react";
import MainHeader from '../../components/MainHeader';
import MainSidebar from '../../components/MainSidebar';
import MainFooter from '../../components/MainFooter';
import ReportByDatewiseContent from "../../components/PageContent/Report/ReportByDatewiseContent";

class ReportByDatewise extends Component {


  render() {
    return (
      <>
        <MainHeader />
        <MainSidebar />
        <ReportByDatewiseContent />
        <MainFooter />
      </>
    );
  };
};

export default ReportByDatewise;