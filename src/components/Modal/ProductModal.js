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
    const categories = props.categories || [];
    const [state, setState ] = useState(
        {
            name:"",
            categoryId:"",
            shortName:"",
            price:"",
            isActive:true,
        }
    );
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const clearInputs =()=>{
        let clear={
            name:"",
            categoryId:"",
            shortName:"",
            price:"",
            isActive:true,
        }
        setState(clear);
        setShowAddCategory(false);
        setNewCategoryName("");
    }

    const handleChangeCategory=(e)=>{
        const value = e.target.value;
        setState(()=>({
            ...state,
            categoryId:value
        }));
    };

    const selectedCategoryId = state.categoryId !== "" ? state.categoryId : (isEdit ? prod.categoryId : "");

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if(!name) return;
        const newCategory = await props.onAddCategory(name);
        setState((s)=>({
            ...s,
            categoryId: newCategory.id,
        }));
        setNewCategoryName("");
        setShowAddCategory(false);
    };

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
        var categoryId = state.categoryId;
        let editState = {
            "name": name.length>0?name:prod.name,
            "categoryId": categoryId!==""?categoryId:prod.categoryId,
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
                    <Form.Label>Category</Form.Label>
                    <div className="d-flex align-items-center">
                        <select
                            name="categoryId"
                            className="form-control"
                            value={selectedCategoryId}
                            onChange={handleChangeCategory}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            variant="outline-secondary"
                            className="ml-2"
                            title="Add new category"
                            onClick={()=>setShowAddCategory(!showAddCategory)}
                        >
                            +
                        </Button>
                    </div>
                    {showAddCategory && (
                        <div className="d-flex align-items-center mt-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="New category name"
                                value={newCategoryName}
                                onChange={(e)=>setNewCategoryName(e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="primary"
                                className="ml-2"
                                disabled={!newCategoryName.trim()}
                                onClick={handleCreateCategory}
                            >
                                Add
                            </Button>
                        </div>
                    )}
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