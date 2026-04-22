import React, { useEffect, useState, useRef } from "react";
import DeleteModal from "../../components/Modal/DeleteModal";
import CustomerModal from "../../components/Modal/CustomerModal";
import CustomToast from "../CustomToast";

import {
  addCustomerSvc,
  deleteCustomerSvc,
  editCustomerSvc,
  getEntireCustomersSvc,
} from "../../actions/customerAction";

import { Modal } from "react-bootstrap";

const CustomerPageContent = () => {
  const myGrid = useRef(null);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState([]);

  const isShowAddEditModal = (value) => {
    setShowAddEditModal(value);
  };

  const isShowDeleteModal = (value) => {
    setShowDeleteModal(value);
  };

  const handleAddClick = () => {
    setIsEdit(false);
    isShowAddEditModal(true);
  };

  const handleEditClick = (customer) => {
    setCurrentCustomer(customer);
    setIsEdit(true);
    isShowAddEditModal(true);
  };

  const handleDeleteClick = (customer) => {
    console.log("clicked");
    setCurrentCustomer(customer);
    isShowDeleteModal(true);
  };

  const addCustomer = (state) => {
    addCustomerSvc(state)
      .then((res) => {
        if (res.status == 200) {
          CustomToast("success","Added Successfully");
          loadCustomersGrid();
        }
      })
      .catch((error) => {
        CustomToast("error", "Try again");
        console.log(error);
      });
  };

  const editCustomer = (state) => {
    console.log(state);
    editCustomerSvc(currentCustomer.id, state)
      .then((res) => {
        if (res.status == 200) {
          CustomToast("success", "Saved successfully");
          console.log("Update successfully");
          loadCustomersGrid();
        }
      })
      .catch((error) => {
        CustomToast("error", "Try again");
        console.log(error);
      });
  };

  const deleteCustomer = (id) => {
    deleteCustomerSvc(id)
      .then((res) => {
        if (res.status == 200) {
          CustomToast("success", "Deleted successfully");
          console.log("Delete successfully");
          loadCustomersGrid();
        }
      })
      .catch((error) => {
        CustomToast("error", "Try again");
        console.log(error);
      });
  };

  const getTableContent = (customersList) => {
    window.jQuery(myGrid.current).jsGrid({
      height: "auto",
      width: "100%",
      sorting: true,
      paging: true,
      heading: true,
      data: customersList,
      fields: [
        { name: "id", type: "text", title: "Id" },
        { name: "name", type: "text", title: "Name" },
        { name: "mobile", type: "number", title: "Mobile Number" },
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

  async function loadCustomersGrid() {
    let res = await getEntireCustomersSvc();
    console.log(res);
    if (res.data !== null) {
      getTableContent(res.data);
    } else {
      CustomToast("error", "Failed to load data please try again");
    }
  }

  useEffect(() => {
    loadCustomersGrid();
  }, []);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Customers</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Customer</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Customer List</h3>
            <div className="card-tools">
              <button
                type="button"
                className="btn btn-tool"
                onClick={handleAddClick}
              >
                <i className="fas fa-plus"></i>&nbsp;&nbsp;Customer
              </button>
            </div>
          </div>
          <div className="card-body">
            <div id="jsGrid1" ref={myGrid}></div>
            <CustomerModal
              currentCustomer={isEdit ? currentCustomer : []}
              isOpen={showAddEditModal}
              toggle={isShowAddEditModal}
              isEdit={isEdit}
              AddCustomer={addCustomer}
              EditCustomer={editCustomer}
            />
            <DeleteModal
              isOpen={showDeleteModal}
              obj={currentCustomer}
              toggle={isShowDeleteModal}
              delete={deleteCustomer}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerPageContent;

{
  /* <MDBTable>
<MDBTableHead >
     <tr className='table-primary'>
     <th></th>
     <th>Customer</th>
     <th>Mobile number</th>
     <th></th>
     <th></th>
     </tr>
 </MDBTableHead>
 <MDBTableBody>
      {customersList.map(renderList)}
  </MDBTableBody>
  <tfoot>
     <tr>
     <td colSpan={2}>Total number of customer</td>
     <td>{customersList.length}</td>
     </tr>
  </tfoot>
</MDBTable> 



const renderList = (customer, index) => {
    return (
      <tr key={index} className="table-light">
        <td>{index + 1}</td>
        <td>{customer.name}</td>
        <td>{customer.mobile}</td>
        <td>
          <Pencil onClick={() => handleEditClick(customer)}></Pencil>
        </td>
        <td>
          <Trash onClick={() => handleDeleteClick(customer)}></Trash>
        </td>
      </tr>
    );
  };


*/
}
