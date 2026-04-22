import React, { useState } from "react";
import { SET_USER_INFO } from "../actions/type";
import "../styles/loginPage.css";
import { loginSvc } from "../actions/authAction";
import history from "../history";
import { dispatch } from '../reducers/authReducer';
import CustomToast from '../components/CustomToast';


const LoginPage = () => {
  const [state, setState] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(() => ({
      ...state,
      [name]: value,
    }));
  };


  const login = (e) => {
    e.preventDefault();
    loginSvc(state)
      .then((res) => {
        //console.log(res);
        if (res.status == 200) {
          delete res.data.password;
          dispatch({
            payload: res.data,
            type: SET_USER_INFO,
          });
          localStorage.setItem("user", JSON.stringify(res.data));
          CustomToast("success","Welcome " + res.data.firstName)
          history.push("/dashboard");
        }
        else{
          CustomToast("error","Login failed. Please check the username and password.")
          }
      })
      .catch((error) => {
        console.log(error);
        CustomToast("error","Login failed. Please check the username and password.")
      });
  };

  return (
    <div className="hold-transition login-page">
      <div className="login-box">
        {/* <!-- /.login-logo --> */}
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <a href="../../index2.html" className="h1">
              <b>Admire&nbsp;</b>POS
            </a>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in to start your session</p>

            <form action="../../index3.html" method="post">
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope"></span>
                  </div>
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input type="checkbox" id="remember" />
                    <label for="remember">&nbsp;Remember Me</label>
                  </div>
                </div>
                {/* <!-- /.col --> */}
                <div className="col-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    onClick={login}
                  >
                    Sign In
                  </button>
                </div>
                {/* <!-- /.col --> */}
              </div>
            </form>

            {/* <p className="mb-1">
        <a href="forgot-password.html">I forgot my password</a>
      </p> */}
          </div>
          {/* <!-- /.card-body --> */}
        </div>
        {/* <!-- /.card --> */}
      </div>
    </div>

    //////////////////////////////////////////////////////
    // <div className="auth-wraper">
    //   <div className="auth-inner">
    //     <form>
    //       <div>
    //         <h3>Sign In</h3>
    //         <div className="mb-3">
    //           <label>Username</label>
    //           <input
    //             type="text"
    //             className="form-control"
    //             placeholder=""
    //             name="username"
    //             value={state.username}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div className="mb-3">
    //           <label>Password</label>
    //           <input
    //             type="password"
    //             className="form-control"
    //             placeholder=""
    //             name="password"
    //             value={state.password}
    //             onChange={handleChange}
    //           />
    //         </div>
    //         <div className="d-grid gap-2">
    //           <input
    //             className="submit"
    //             type="submit"
    //             value="SIGN IN"
    //             onClick={auth}
    //           />
    //         </div>
    //         <div className="d-grid gap-2">
    //         </div>
    //       </div>
    //     </form>
    //   </div>
    // </div>
  );
};

export default LoginPage;
