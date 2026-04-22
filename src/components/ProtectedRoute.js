import React from "react";
import { Route } from "react-router-dom";
import history from "../history";

export const ProtectedRoute = ({
  component: Component,
  ...rest
}) => {

  return (
    <Route
      {...rest}
      render={props => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user !== null) {
          return <Component {...props} />;
        } else {
          console.log("logout");
          return history.push("/");
        }
      }}
    />
  );
};
