import React from "react";
import "../styles/sideBar.css";
import { Offcanvas, Nav, Navbar, Container, NavDropdown } from "react-bootstrap";
import { Cart } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import utils from "../utils";
import { useStoreState } from "../reducers/productReducer";

const logout = () => {
  axios.get("/logout").then(() => this.props.history.push("/"));
};

const SideBar = () => {
  const cartCount = useStoreState("cartCount");

  return (
    <>
      {[false].map((expand) => (
        <Navbar key={expand} bg="white" expand={expand}>
          <Container className="container-smooth-sm">
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} className="hamburger" />
            <Navbar.Offcanvas id={`offcanvasNavbar-expand-${expand}`} aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`} placement="start">
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>Hello {utils.getUser().firstName}!</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <Nav.Link href="/dashboard">Home</Nav.Link>
                  <Nav.Link href="/cart">Cart</Nav.Link>
                  <Nav.Link href="/order">Place Order</Nav.Link>
                  <NavDropdown title="Products " id="basic-nav-dropdown">
                    <NavDropdown.Item href="/addProduct">Add Product</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Reports " id="basic-nav-dropdown">
                    <NavDropdown.Item href="/deliveryReport">Delivery</NavDropdown.Item>
                    <NavDropdown.Item href="/nondeliveryReport">Non Delivery</NavDropdown.Item>
                    <NavDropdown.Item href="/productReport">Product</NavDropdown.Item>
                    <NavDropdown.Item href="/customerReport">Customer</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link href="#" onClick={logout}>
                    SignOut
                  </Nav.Link>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
            <Navbar.Brand href="/dashboard" className="m-auto">
              Sri Murugan Sweets
            </Navbar.Brand>
            <Link to="/cart">
              <Cart></Cart>
              {cartCount}
            </Link>
          </Container>
        </Navbar>
      ))}
    </>
  );
};

export default SideBar;
