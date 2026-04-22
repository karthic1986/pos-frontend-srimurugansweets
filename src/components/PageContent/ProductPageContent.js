import React,{useEffect, useState,useRef} from 'react';
import { getEntireProductsSvc,addProductSvc,editProductSvc,deleteProductSvc } from '../../actions/productAction';
import ProductModal from '../../components/Modal/ProductModal';
import DeleteModal from '../../components/Modal/DeleteModal';
import CustomToast from '../../components/CustomToast';

const ProductPageContent=()=>{

  const myGrid = useRef(null);
    
    const [showAddEditModal,setShowAddEditModal] = useState(false);
    const [showDeleteModal,setShowDeleteModal] = useState(false);
    const [isEdit,setIsEdit] = useState(false);
    const [currentProd,setCurrentProd] = useState([]);
    
    const isShowAddEditModal = (value) => {
      setShowAddEditModal(value);
    };
  
    const isShowDeleteModal = (value) => {
      setShowDeleteModal(value);
    };
  

    const handleAddClick=()=>{
        setIsEdit(false);
        isShowAddEditModal(true);
    }

    const handleEditClick=(prod)=>{
        setCurrentProd(prod);
        setIsEdit(true);
        isShowAddEditModal(true);
    }

    const handleDeleteClick=(prod)=>{
        setCurrentProd(prod);
        isShowDeleteModal(true);
    }

    const addProduct =(state)=>{
        addProductSvc(state)
        .then((res)=>{
            if(res.status==200){
                CustomToast("success","Added Successfully");
                loadProductsGrid();
            }
        })
        .catch((error)=>{
            CustomToast("error","Try again");
            console.log(error);
        });
    }

    const editProduct=(state)=>{
        editProductSvc(currentProd.id,state)
        .then((res) => {
            if(res.status==200)
            {
            CustomToast("success","Updated Successfully");
            loadProductsGrid();
            }
          })
          .catch((error) => {
            CustomToast("error","Try again");
            console.log(error);
          });
      };
    

    const deleteProduct=(id)=>{
        deleteProductSvc(id)
        .then((res)=>{
        if(res.status==200)
        {
            CustomToast("success","Deleted Successfully");
            console.log("Delete successfully");
            loadProductsGrid();
        }
      })
      .catch((error) => {
        CustomToast("error","Try again");
        console.log(error);
        });
    };


    const getTableContent = (productList) => {
        window.jQuery(myGrid.current).jsGrid({
          height: "auto",
          width: "100%",
          sorting: true,
          paging: true,
          heading: true,
          data: productList,
          fields: [
            { name: "id", type: "text", title: "Id" },
            { name: "name", type: "text", title: "Name" },
            { name: "price", type: "number", title: "Price" },
            {
              type: "control",
    
              itemTemplate: function (value, item) {
                var editDeleteBtn = $(
                  '<input class="jsgrid-button jsgrid-edit-button" type="button" title="Edit"><input class="jsgrid-button jsgrid-delete-button" type="button" title="Delete">'
                ).on("click", function (e) {
                  if (e.target.title == "Edit") {
                    handleEditClick(item);
                  } else {
                    handleDeleteClick(item);
                  }
                });
    
                return editDeleteBtn; //
              },
            },
          ],
        });
      };

      async function loadProductsGrid() {
        let res = await getEntireProductsSvc();
        if (res.data !== null) {
          getTableContent(res.data);
        } else {
            CustomToast("error","Failed to load data please try again");
        }
      }
    
      useEffect(() => {
        loadProductsGrid();
      }, []);
    
    
    return(
        <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Products</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Product</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Product List</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  onClick={handleAddClick}
                >
                  <i className="fas fa-plus"></i>&nbsp;&nbsp;Product
                </button>
              </div>
            </div>
            <div className="card-body">
              <div id="jsGrid1" ref={myGrid}></div>
              <ProductModal
                currentProd={isEdit ? currentProd : []}
                isOpen={showAddEditModal}
                toggle={isShowAddEditModal}
                isEdit={isEdit}
                AddProduct={addProduct}
                EditProduct={editProduct}
              />
              <DeleteModal
                isOpen={showDeleteModal}
                obj={currentProd}
                toggle={isShowDeleteModal}
                delete={deleteProduct}
              />
            </div>
          </div>
        </section>
      </div>
    );
  
}

export default ProductPageContent;