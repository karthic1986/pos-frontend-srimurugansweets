import React, { useRef, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import '../../styles/modal.css';

const CustomerModal=(props)=>{
    const customer = props.currentCustomer;
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const isEdit = props.isEdit;
    const title = isEdit?"Edit Customer":"Add Customer";
    const [state, setState ] = useState(
        {
            name:"",
            mobile:"",          
            email:"",
            description:"",
            isActive:true,
        }
    );
    
    const clearInputs =()=>{
        let clear={
            name:"",
            mobile:"",
            email:"",
            description:"",
            isActive:true,
        }
        setState(clear);
    }
    const handleChangeName=()=>{
        const{name,value} = ref1.current;
        setState(()=>({
            ...state,
            [name]:value
        }));

    };

    const handleChangeMobile=()=>{
        const{name,value} = ref2.current;
        setState(()=>({
            ...state,
            [name]:value
        }));
    };

    const handleChangeEmail=()=>{
        const{name,value} = ref3.current;
        setState(()=>({
            ...state,
            [name]:value
        }));

    };

    const handleChangeDescription=()=>{
        const{name,value} = ref4.current;
        setState(()=>({
            ...state,
            [name]:value
        }));

    };
    
    const handleChangeCheckbox =(e)=>{
        const name  = e.target.name;
            setState(() => ({
                ...state,
                [name]: e.target.checked
              }));
      }

    
      const EditFunction=()=>{
        var name = state.name;
        var mobile = state.mobile;
        var email = state.email;
        var description = state.description;
        var isActive = state.isActive;
        let editState = {
            "name":name.length>0?name:customer.name,
            "mobile":mobile.length>0?mobile:customer.mobile,
            "email":email.length>0?email:customer.email,
            "description":description.length>0?description:customer.description,
            "isActive":isActive
        }
        props.EditCustomer(editState);
    }

    return(
        <Modal show={props.isOpen} centered onHide={()=>{props.toggle(),clearInputs()}}>
            <Modal.Header closeButton className ={isEdit? "editModal":"addModal"}>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <div className="form-outline">
                    <Form.Label>Name</Form.Label>
                    <input
                        ref={ref1}
                        type="text"
                        name='name'
                        className='form-control'
                        defaultValue={isEdit?customer.name:state.name}
                        onChange={handleChangeName}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <Form.Label>Mobile number</Form.Label>
                    <input
                        onWheel={e=> {e.currentTarget.blur()}}
                        ref={ref2}
                        type="number"
                        name='mobile'
                        className='form-control'
                        defaultValue={isEdit?customer.mobile:state.mobile}
                        onChange={handleChangeMobile}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <Form.Label>email</Form.Label>
                    <input
                        ref={ref3}
                        type="email"
                        name='email'
                        className='form-control'
                        defaultValue={isEdit?customer.email:state.email}
                        onChange={handleChangeEmail}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <Form.Label>Description</Form.Label>
                    <input
                        ref={ref4}
                        type="text"
                        name='description'
                        className='form-control'
                        defaultValue={isEdit?customer.description:state.description}
                        onChange={handleChangeDescription}
                    />
                </div>
                <br/>
               
                <div className="form-outline">
                    <div className ="form-check ">
                    <input 
                        className="form-check-input " 
                        type="checkbox" 
                        value= "isActive" 
                        name="isActive"
                        defaultChecked={isEdit?customer.isActive:state.isActive}
                        onChange={handleChangeCheckbox}
                    />
                    <label for="isActive"> Active </label>
                    </div>
                </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={()=>{props.toggle(), clearInputs()}}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={
                        () => {
                            props.toggle();
                            clearInputs();
                            isEdit?EditFunction():props.AddCustomer(state);
                        }
                    }>
                    Save
                </Button>
                </Modal.Footer>
        </Modal>

    );
}

export default CustomerModal;