import React from "react";
import { Link } from "react-router-dom";
import CartTable from "../CartTable";
import { CartForm } from "../CartForm";
import { useStoreState } from "../../reducers/productReducer";
import { useStoreState as useStoreStateDelivery, dispatch as dispatchDelivery } from "../../reducers/deliveryReducer";
import { createOrderSvc } from "../../actions/createOrderAction";
import "../../styles/cart.css";
import CustomToast from "../../components/CustomToast";
import history from "../../history";
import { dispatch as dispatchProduct } from "../../reducers/productReducer";
import { GET_ACTIVE_PRODUCTS, GET_ORDER_DETAILS } from "../../actions/type";
import CustomPrintReport from "../CustomPrintReport";
import ProgressBar from "@badrap/bar-of-progress";

const CartContent = () => {
  const progress = new ProgressBar();
  const isOrderFromDelivery = useStoreStateDelivery("isOrderFromDelivery");
  const isOrderFromEdit = useStoreStateDelivery("isOrderFromEdit");
  const orderFromDelivery = useStoreStateDelivery("orderDetails").order;
  const orderDetailsFromDelivery = useStoreStateDelivery("orderDetails").orderDetails;
  let productList;
  if (isOrderFromDelivery != true && isOrderFromEdit != true) {
    productList = useStoreState("productList");
  } else {
    productList = orderDetailsFromDelivery;
    dispatchProduct({
      payload: productList,
      type: GET_ACTIVE_PRODUCTS,
    });
  }

  const cartList = [];

  productList.map((list) => {
    if (list.qty > 0) {
      list.total = list.qty * list.price;
    }
  });

  let totalQty = 0;
  let totalAmount = 0;
  let order = [];

  productList.map((prod) => {
    totalQty = totalQty + prod.qty;
    totalAmount = totalAmount + prod.qty * prod.price;
  });

  const clearOrder = () => {
    productList.map((prod) => {
      prod.qty = 0;
    });
    dispatchProduct({
      payload: productList,
      type: GET_ACTIVE_PRODUCTS,
    });
  };

  const printReport = (orderDetails, orderId, productList) => {
    CustomPrintReport(orderDetails, orderId, productList);
    setTimeout(() => {
      clearOrder();
      progress.finish();
      history.push("/order");
    }, 1000);
  };

  const createOrder = async (customerDetails, orderId) => {
    progress.start();
    order = {
      customerNumber: customerDetails.customerNumber,
      customerName: customerDetails.customerName,
      payment: customerDetails.payment,
      totalQty: totalQty,
      totalAmount: totalAmount,
      orderDate: new Date(),
      isDelivery: customerDetails.isDelivered,
      deliveryTime: customerDetails.deliveryTime,
      deliveryDate: customerDetails.deliveryDate === null ? new Date() : customerDetails.deliveryDate,
      notes: customerDetails.notes,
      createdBy: 1,
      updatedBy: 1,
      id: orderId,
      discount: customerDetails.discount === "" ? 0 : customerDetails.discount,
    };

    productList.map((prod) => {
      if (prod.qty > 0) {
        cartList.push({
          productId: prod.id,
          qty: prod.qty,
          price: prod.price,
          totalAmount: prod.total,
          createdBy: 1,
          updatedBy: 1,
        });
      }
    });

    let payload = { order: order, orderDetails: cartList };
    console.log(payload);
    createOrderSvc(payload)
      .then((res) => {
        console.log(res);
        if (res.status == 200) {
          CustomToast("success", "Order placed successfully");
          printReport(order, isOrderFromDelivery || isOrderFromEdit ? res.data.orderId : res.data.id, productList);
          if (isOrderFromDelivery || isOrderFromEdit)
            setTimeout(() => {
              dispatchDelivery({
                payload: [],
                type: GET_ORDER_DETAILS,
                isOrderFromDelivery: false,
                isOrderFromEdit: false,
              });
            }, 2000);
        } else {
          CustomToast("error", "Failed to create order list. Please try again..");
        }
      })
      .catch((error) => {
        console.log(error);
        CustomToast("error", "Failed to create order list. Please try again..");
      });
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Cart</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Cart</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              {isOrderFromDelivery != true && (
                <Link to={"/order"}>
                  <button type="button" class="btn btn-tool" data-card-widget="collapse">
                    <i class="fas fa-arrow-left"></i>
                  </button>
                </Link>
              )}
              Order Summary
            </h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <CartTable prodList={productList} />
          </div>
          <div className="row">
            <div className="col total">Total Quantity: {totalQty}</div>
            <div className="col total">Total Amount: ₹{totalAmount}</div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Customer Details</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <CartForm createOrder={createOrder} prodList={productList} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartContent;
