import React from "react";
import { useLocation } from "react-router-dom";

const MainSidebar = () => {
  const { pathname } = useLocation();
  const navLinkClass = (path) => `nav-link${pathname === path ? " active" : ""}`;

  return (
    // <!-- Main Sidebar Container -->
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* <!-- Brand Logo --> */}
      <a href="/dashboard" className="brand-link">
        <img src={process.env.PUBLIC_URL + "dist/img/AdminLTELogo.png"} alt="AdminLTE Logo" className="brand-image img-circle elevation-3" style={{ opacity: 0.8 }} />
        <span className="brand-text font-weight-light">Admire POS</span>
      </a>

      {/* <!-- Sidebar --> */}
      <div className="sidebar">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className="nav-item">
              <a href="/dashboard" className={navLinkClass("/dashboard")}>
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/customer" className={navLinkClass("/customer")}>
                <i className="nav-icon fas fa-users"></i>
                <p>Customers</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/product" className={navLinkClass("/product")}>
                <i className="nav-icon fas fa-th"></i>
                <p>Products</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/order" className={navLinkClass("/order")}>
                <i className="nav-icon fas fa-edit"></i>
                <p>Order</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/orderedit" className={navLinkClass("/orderedit")}>
                <i className="nav-icon fas fa-solid fa-pen"></i>
                <p>Order Edit</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/delivery" className={navLinkClass("/delivery")}>
                <i className="nav-icon fas fa-solid fa-truck"></i>
                <p>Order Delivery</p>
              </a>
            </li>
            {/* <li className="nav-item">
                  <a href="#" className="nav-link">
                    <i className="nav-icon fas fa-chart-pie"></i>
                    <p>
                      Reports
                      <i className="right fas fa-angle-left"></i>
                      <span className="badge badge-info right">4</span>
                    </p>
                  </a>
                  <ul className="nav nav-treeview">
                    <li className="nav-item">
                      <a href="/deliveryReport" className="nav-link">
                        <i className="far fa-circle nav-icon"></i>
                        <p>Delivery</p>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="/productReport" className="nav-link">
                        <i className="far fa-circle nav-icon"></i>
                        <p>Product wise</p>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="/customerReport" className="nav-link">
                        <i className="far fa-circle nav-icon"></i>
                        <p>Customer wise</p>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="/dateWiseReport" className="nav-link">
                        <i className="far fa-circle nav-icon"></i>
                        <p>Date wise</p>
                      </a>
                    </li>
                  </ul>
                </li> */}

            <br></br>
            <div className="user-panel"> </div>
            <li className="nav-item">
              <a href="/deliveryReport" className={navLinkClass("/deliveryReport")}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Delivery</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/nondeliveryReport" className={navLinkClass("/nondeliveryReport")}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Non-Delivery</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/productReport" className={navLinkClass("/productReport")}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Product wise</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/customerReport" className={navLinkClass("/customerReport")}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Customer wise</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/dateWiseReport" className={navLinkClass("/datewiseReport")}>
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Date wise</p>
              </a>
            </li>
          </ul>
        </nav>
        {/* <!-- /.sidebar-menu --> */}
      </div>
      {/* <!-- /.sidebar --> */}
    </aside>
  );
};

export default MainSidebar;
