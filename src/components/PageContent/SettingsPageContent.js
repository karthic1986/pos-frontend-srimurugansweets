import React from "react";
import { Link, useParams } from "react-router-dom";
import AppSettings from "../Settings/AppSettings";
import "../../styles/settings.css";

// Left menu of the Settings module. Add new settings screens here.
const SETTINGS_MENU = [
  {
    group: "Administration",
    items: [{ key: "app-settings", label: "App Settings", icon: "fas fa-sliders-h", component: AppSettings }],
  },
];

const SettingsPageContent = () => {
  const { section } = useParams();
  const items = SETTINGS_MENU.flatMap((group) => group.items);
  const current = items.find((item) => item.key === section) || items[0];
  const Section = current.component;

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Settings</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/dashboard">Home</a>
                </li>
                <li className="breadcrumb-item">Settings</li>
                <li className="breadcrumb-item active">{current.label}</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="card settings-module">
          <div className="row no-gutters">
            <nav className="col-md-3 col-xl-2 settings-menu">
              {SETTINGS_MENU.map((group) => (
                <div key={group.group}>
                  <div className="settings-menu-group">{group.group}</div>
                  <ul className="nav flex-column">
                    {group.items.map((item) => (
                      <li className="nav-item" key={item.key}>
                        <Link
                          to={`/settings/${item.key}`}
                          className={`nav-link${item.key === current.key ? " active" : ""}`}
                        >
                          <i className={`${item.icon} settings-menu-icon`}></i>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="col-md-9 col-xl-10">
              <Section />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPageContent;
