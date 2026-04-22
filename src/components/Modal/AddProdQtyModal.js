import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../../styles/modal.css";

const AddProdQtyModal = (props) => {
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [qty, setQty] = useState(0);
  const incrementQty = () => setQty(qty + 1);
  let decrementQty = () => setQty(qty - 1);

  if (qty <= 0) {
    decrementQty = () => setQty(0);
  }

  let handleChange = (e) => {
    if (e.target.name === "qty") {
      setQty(parseInt(e.target.value));
    }
  };

  return (
    <Modal show={props.isOpen} centered onHide={props.toggle}>
      <Modal.Header closeButton>
        <Modal.Title>Add Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="customerNumber"
                  required
                  className="form-control"
                  value={prodName}
                  onChange={(e) => {
                    setProdName(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  onWheel={e=> {e.currentTarget.blur()}}
                  name="customerNumber"
                  required
                  className="form-control"
                  value={prodPrice}
                  onChange={(e) => {
                    setProdPrice(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <span
              className="info-circle-icon-dialog bg-danger"
              onClick={decrementQty}
            >
              <i className="fas fa-minus"></i>
            </span>
            <div className="form-group">
              <label>Qty</label>
              <input
                type="number"
                onWheel={e=> {e.currentTarget.blur()}}
                value={qty}
                name="qty"
                style={{ width: "100px" }}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <span
              className="info-circle-icon-dialog bg-success"
              onClick={incrementQty}
            >
              <i className="fas fa-plus"></i>
            </span>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.toggle}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            props.payload(qty, prodPrice, prodName), props.toggle();
          }}
        >
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProdQtyModal;
