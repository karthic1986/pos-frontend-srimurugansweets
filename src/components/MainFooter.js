import React from "react";

const MainFooter = () => {
  return (
    <footer className="main-footer">
      <strong>
        Copyright &copy; 2021-2022{" "}
        <a href="https://admiretechnology.com">Admire Technology</a>.
      </strong>
      &nbsp;All rights reserved.
      <div className="float-right d-none d-sm-inline-block">
        <b>Version</b> 0.0.1
      </div>
    </footer>
  );
};

export default MainFooter;
