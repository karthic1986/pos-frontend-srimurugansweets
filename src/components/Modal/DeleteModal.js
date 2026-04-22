import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const DeleteModal = props =>{
    const obj = props.obj;
    return(
        <Modal show={props.isOpen} centered onHide={props.toggle}>
        <Modal.Header closeButton className='deleteModal'>
            <Modal.Title>{obj.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <h6>Are you sure you want to delete?</h6>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={
            () => {
              props.toggle(false)
            }
          }>
          No
        </Button>
        <Button
          variant="primary"
          onClick={
            () => {
              props.delete(obj.id);
              props.toggle(false)
            }
          }
        >
          Yes
        </Button>
        </Modal.Footer>
        </Modal>
    );
}

export default DeleteModal;