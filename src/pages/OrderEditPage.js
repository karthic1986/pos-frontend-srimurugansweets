import React, { Component } from "react";
import MainHeader from "../components/MainHeader";
import MainSidebar from "../components/MainSidebar";
import MainFooter from "../components/MainFooter";
import OrderEditPageContent from "../components/PageContent/OrderEditPageContent";

class OrderEditPage extends Component {
  render() {
    return (
      <div>
        <MainHeader />
        <MainSidebar />
        <OrderEditPageContent />
        <MainFooter />
      </div>
    );
  }
}

export default OrderEditPage;
