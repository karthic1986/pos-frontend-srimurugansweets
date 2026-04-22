import React from "react";
import { logoutSvc } from "../actions/authAction";
import history from "../history";

const logout = () => {
  //console.log("");
  logoutSvc();
  history.push("/");
  //axios.get("/logout").then(()=>this.props.history.push("/"));
};

const MainSidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

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
        {/* <!-- Sidebar user panel (optional) --> */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img src={process.env.PUBLIC_URL + "dist/img/user2-160x160.png"} className="img-circle elevation-2" alt="User Image" />
          </div>
          <div className="info">
            <a href="#" className="d-block">
              {user.firstName}
            </a>
          </div>
        </div>

        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className="nav-item">
              <a href="/dashboard" className="nav-link">
                <i className="nav-icon fas fa-tachometer-alt"></i>
                <p>Dashboard</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/customer" className="nav-link">
                <i className="nav-icon fas fa-users"></i>
                <p>Customers</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/product" className="nav-link">
                <i className="nav-icon fas fa-th"></i>
                <p>Products</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/order" className="nav-link">
                <i className="nav-icon fas fa-edit"></i>
                <p>Order</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/orderedit" className="nav-link">
                <i className="nav-icon fas fa-solid fa-pen"></i>
                <p>Order Edit</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/delivery" className="nav-link">
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
              <a href="/deliveryReport" className="nav-link">
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Delivery</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/nondeliveryReport" className="nav-link">
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Non-Delivery</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/productReport" className="nav-link">
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Product wise</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/customerReport" className="nav-link">
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Customer wise</p>
              </a>
            </li>
            <li className="nav-item">
              <a href="/dateWiseReport" className="nav-link">
                <i className="nav-icon fas fa-chart-pie"></i>
                <p>Date wise</p>
              </a>
            </li>
            <br></br>
            <div className="user-panel"> </div>

            <li className="nav-item">
              <a href="#" className="nav-link" onClick={logout}>
                <i className="nav-icon fas fa-user"></i>
                <p>Logout</p>
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
