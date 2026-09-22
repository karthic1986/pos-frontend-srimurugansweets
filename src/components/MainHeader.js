import React from 'react';
import '../styles/mainHeader.css';
import { logoutSvc } from '../actions/authAction';
import history from '../history';

const logout = () => {
    logoutSvc();
    history.push('/');
};

const MainHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        //  <!-- Navbar -->
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            {/* <!-- Left navbar links --> */}
            <ul className="navbar-nav">
                <li className="nav-item">
                    <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars"></i></a>
                </li>
                <li className="nav-item d-none d-sm-inline-block">
                    <a href="index3.html" className="nav-link">Home</a>
                </li>
            </ul>

            {/* <!-- Right navbar links --> */}
            <ul className="navbar-nav ml-auto align-items-center">
                {/* <!-- Notifications Dropdown Menu --> */}
                <li className="nav-item dropdown">
                    <a className="nav-link" data-toggle="dropdown" href="#">
                        <i className="far fa-bell"></i>
                        <span className="badge badge-warning navbar-badge">15</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                        <span className="dropdown-item dropdown-header">15 Notifications</span>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-envelope mr-2"></i> 4 new messages
                            <span className="float-right text-muted text-sm">3 mins</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-users mr-2"></i> 8 friend requests
                            <span className="float-right text-muted text-sm">12 hours</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-file mr-2"></i> 3 new reports
                            <span className="float-right text-muted text-sm">2 days</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
                    </div>
                </li>

                {/* <!-- User Profile Dropdown --> */}
                <li className="nav-item dropdown user-menu">
                    <a href="#" className="nav-link d-flex align-items-center" data-toggle="dropdown">
                        <span className="header-user-name font-weight-bold d-none d-sm-inline-block">{user.firstName}</span>
                        <img
                            src={process.env.PUBLIC_URL + "dist/img/user2-160x160.png"}
                            className="header-user-avatar img-circle elevation-2"
                            alt="User"
                        />
                    </a>
                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                        <a href="#" className="dropdown-item" onClick={logout}>
                            <i className="fas fa-sign-out-alt mr-2"></i>
                            Logout
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
        //   <!-- /.navbar -->
    );
};



export default MainHeader;