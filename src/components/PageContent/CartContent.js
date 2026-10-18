import React from "react";
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

  const printReport = (orderDetails, orderId, productList, printOnThermal) => {
    CustomPrintReport(orderDetails, orderId, productList, printOnThermal);
    setTimeout(() => {
      clearOrder();
      progress.finish();
      history.push("/order");
    }, 1000);
  };

  const createOrder = async (customerDetails, orderId, printOnThermal) => {
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
    return createOrderSvc(payload)
      .then((res) => {
        console.log(res);
        if (res.status == 200) {
          CustomToast("success", "Order placed successfully");
          printReport(order, isOrderFromDelivery || isOrderFromEdit ? res.data.orderId : res.data.id, productList, printOnThermal);
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

  const pageTitle = isOrderFromDelivery
    ? `Deliver order #${orderFromDelivery?.id}`
    : isOrderFromEdit
    ? `Edit order #${orderFromDelivery?.id}`
    : "New order";

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>{pageTitle}</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/dashboard">Home</a>
                </li>
                <li className="breadcrumb-item active">{pageTitle}</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <CartForm createOrder={createOrder} prodList={productList} />
      </section>
    </div>
  );
};

export default CartContent;
