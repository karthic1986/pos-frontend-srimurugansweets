import React, { useState, useRef } from "react";
import "../../styles/delivery.css";
import { getOrderDetailsSvc, getSearchResultSvc } from "../../actions/deliveryAction";
import CustomToast from "../CustomToast";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { GET_ORDER_DETAILS } from "../../actions/type";
import { dispatch } from "../../reducers/deliveryReducer";

const OrderEditPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const myGrid = useRef(null);
  const history = useHistory();

  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchButton = () => {
    getSearchResultSvc(searchTerm)
      .then((res) => {
        if (res.status == 200) {
          CustomToast("success", "Here is your search result");
          loadSearchResult(res.data);
        }
      })
      .catch((error) => {
        CustomToast("error", "Try again");
        console.log(error);
      });
  };

  const handleSelectClick = (item) => {
    let id = item.id;
    getOrderDetailsSvc(id)
      .then((res) => {
        console.log(res.data);
        if (res.status == 200) {
          dispatch({
            payload: res.data,
            type: GET_ORDER_DETAILS,
            isOrderFromDelivery: false,
            isOrderFromEdit: true,
          });
          history.push("/cart");
        }
      })
      .catch((error) => {
        console.log(error);
        CustomToast("error", "Failed to Load Order details. Please try again..");
      });
  };

  function loadSearchResult(data) {
    data.map((d) => {
      d.orderDate = moment(d.orderDate).format("DD/MM/YYYY");
      d.deliveryDate = moment(d.deliveryDate).format("DD/MM/YYYY");
      d.balanceAmt = d.totalAmount - d.payment;
    });
    console.log("data ", data);
    window.jQuery(myGrid.current).jsGrid({
      height: "auto",
      width: "100%",
      sorting: true,
      paging: true,
      heading: true,
      data: data,
      fields: [
        { name: "id", type: "number", title: "Order No." },
        { name: "orderDate", type: "date", title: "Order Date" },
        { name: "deliveryDate", type: "date", title: "Delivery Date" },
        { name: "deliveryTime", type: "date", title: "Delivery Time" },
        { name: "totalQty", type: "number", title: "Quantity" },
        { name: "totalAmount", type: "number", title: "Amount" },
        { name: "payment", type: "number", title: "Paid" },
        { name: "balanceAmt", type: "number", title: "Balance" },
        {
          type: "control",
          itemTemplate: function (value, item) {
            var selectBtn = $('<input class="jsgrid-button  jsgrid-edit-button" type="button" title="Select">').on("click", function (e) {
              handleSelectClick(item);
            });
            return selectBtn;
          },
        },
      ],
    });
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Order edit</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Order Edit</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Search Order</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
            {/* 
                        <div className='box'>
                            <i className='fa fa-search'></i>
                            <input
                                type="text"
                                name="searchTerm"
                                required
                                className="form-control"
                                value={searchTerm}
                                onChange={handleSearchTerm}
                                placeholder="Customer mobile number / order Id"
                            />
                        </div>
                        <br />
                        <button
                            className='btn btn-primary d-grid'
                            type='submit'
                            onClick={handleSearchButton}
                        >
                            Search
                        </button> */}
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <div className="box">
                    <i className="fa fa-search"></i>
                    <input type="text" name="searchTerm" required className="form-control" value={searchTerm} onChange={handleSearchTerm} placeholder="Customer mobile number / order Id" />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <button className="btn btn-primary d-grid" type="submit" onClick={handleSearchButton}>
                    Search
                  </button>
                </div>
              </div>
              <div className="col-md-4"></div>
            </div>

            {/* <div id="jsGrid1" ref={myGrid}></div> */}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Search Results</h3>
          </div>
          {/* <!-- /.card-header --> */}
          <div className="card-body">
            <div id="jsGrid1" ref={myGrid}></div>
          </div>
          {/* <!-- /.card-body --> */}
        </div>
      </section>
    </div>
  );
};

export default OrderEditPageContent;
