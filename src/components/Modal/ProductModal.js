import React, { useRef, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import '../../styles/modal.css';

const ProductModal = props =>{
    
    const prod = props.currentProd;
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const isEdit = props.isEdit;
    const title = isEdit?"Edit Product":"Add Product";
    const [state, setState ] = useState(
        {
            name:"",
            categoryId:1,
            shortName:"",
            price:"",
            isActive:true,
        }
    );
    
    const clearInputs =()=>{
        let clear={
            name:"",
            categoryId:1,
            shortName:"",
            price:"",
            isActive:true,
        }
        setState(clear);
    }

    const handleChangeShortName=()=>{
        const{name,value} = ref2.current;
        setState(()=>({
            ...state,
            [name]:value
        }));

    };

    const handleChangePrice=()=>{
        const{name,value} = ref3.current;
        setState(()=>({
            ...state,
            [name]:value
        }));
    };

    const handleChangeName=()=>{
        const{name,value} = ref1.current;
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
        var sname = state.shortName;
        var price = state.price;
        var isActive = state.isActive;
        let editState = {
            "name": name.length>0?name:prod.name,
            "categoryId":1,
            "shortName": sname.length>0? sname:prod.shortName,
            "price": price>0?price:prod.price,
            "isActive": isActive 
        }
        props.EditProduct(editState);
    }

     return(
        <Modal show={props.isOpen} centered onHide={()=>{props.toggle(),clearInputs()}}>
            <Modal.Header closeButton className = {isEdit?"editModal":"addModal"}>
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <div className="form-outline">
                    <Form.Label>Product Name</Form.Label>
                    <input
                        ref={ref1}
                        type="text"
                        name='name'
                        className='form-control'
                        defaultValue={isEdit?prod.name:state.name}
                        //value={state.name}
                        onChange={handleChangeName}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <Form.Label>Short Name</Form.Label>
                    <input
                        ref={ref2}
                        type="text"
                        name='shortName'
                        className='form-control'
                        defaultValue={isEdit?prod.shortName:state.shortName}
                        //value={state.shortName}
                        onChange={handleChangeShortName}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <Form.Label>Price</Form.Label>
                    <input
                        ref={ref3}
                        type="text"
                        name='price'
                        className='form-control'
                        defaultValue={isEdit?prod.price:state.price}
                        //value={state.price}
                        onChange={handleChangePrice}
                    />
                </div>
                <br/>
                <div className="form-outline">
                    <div className ="form-check ">
                    <input 
                        ref={ref4}
                        className="form-check-input " 
                        type="checkbox" 
                        value= "isActive" 
                        name="isActive"
                        defaultChecked={isEdit?prod.isActive:state.isActive}
                        //checked={state.isActive}
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
                            console.log(state);
                            isEdit?EditFunction():props.AddProduct(state);
                        }
                    }>
                    Save
                </Button>
                </Modal.Footer>
        </Modal>
    );

}

export default ProductModal;