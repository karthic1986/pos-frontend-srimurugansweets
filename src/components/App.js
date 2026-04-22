import React from "react";
import { Router, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/DashboardPage";
import Cart from "../pages/CartPage";
import OrderPage from "../pages/OrderPage";
import ReportByProduct from "../pages/Reports/ReportByProduct";
import ReportByCustomer from "../pages/Reports/ReportByCustomer";
import ReportDelivery from "../pages/Reports/ReportDelivery";
import ReportNonDelivery from "../pages/Reports/ReportNonDelivery";
import ReportByDatewise from "../pages/Reports/ReportByDatewise";
import ProductPage from "../pages/ProductPage";
import CustomerPage from "../pages/CustomerPage";
import DeliveryPage from "../pages/DeliveryPage";
import OrderEditPage from "../pages/OrderEditPage";
import history from "../history";
import { ProtectedRoute } from "./ProtectedRoute";

const App = () => {
  return (
    <Router history={history}>
      <Route path="/" exact component={LoginPage} />
      <ProtectedRoute path="/dashboard" exact component={Dashboard} />
      <ProtectedRoute path="/cart" exact component={Cart} />
      <ProtectedRoute path="/order" exact component={OrderPage} />
      <ProtectedRoute path="/productReport" exact component={ReportByProduct} />
      <ProtectedRoute path="/customerReport" exact component={ReportByCustomer} />
      <ProtectedRoute path="/deliveryReport" exact component={ReportDelivery} />
      <ProtectedRoute path="/nondeliveryReport" exact component={ReportNonDelivery} />
      <ProtectedRoute path="/datewiseReport" exact component={ReportByDatewise} />
      <ProtectedRoute path="/product" exact component={ProductPage} />
      <ProtectedRoute path="/customer" exact component={CustomerPage} />
      <ProtectedRoute path="/delivery" exact component={DeliveryPage} />
      <ProtectedRoute path="/orderedit" exact component={OrderEditPage} />
    </Router>
  );
};

export default App;
