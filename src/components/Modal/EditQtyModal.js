import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { InputGroup } from 'react-bootstrap';
import '../../styles/modal.css'

const EditQtyModal = props => {

  const [qty, setQty] = useState(0);
  let incrementQty = () => setQty(qty + 1);
  let decrementQty = () => setQty(qty - 1);

  if (qty <= 0) {
    decrementQty = () => setQty(0);
  }

  let handleChange = (e) => {
    if (e.target.name === "qty") {
      setQty(parseInt(e.target.value));
    }
  };
  
  
  useEffect(
    () => {
      setQty(props.qty); 
    }, []);

  return (
    <Modal show={props.isOpen} centered onHide={props.toggle}>
      <Modal.Header closeButton>
        <Modal.Title><h5>{props.heading}</h5></Modal.Title>
      </Modal.Header>
      <Modal.Body>

        <form>
          <div className="row">
            <span className="info-circle-icon-dialog bg-danger" onClick={decrementQty}><i className="fas fa-minus"></i></span>
            <div className="form-group">
              <label>Qty</label>
              <input type="number"
                onWheel={e => { e.currentTarget.blur() }}
                value={qty}
                name="qty"
                style={{ width: "100px" }}
                onChange={handleChange}
                className="form-control" />
            </div>
            <span className="info-circle-icon-dialog bg-success" onClick={incrementQty}><i className="fas fa-plus"></i></span>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.toggle}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={
            () => {
              props.value(qty);
              props.toggle();
            }
          }
        >
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditQtyModal;