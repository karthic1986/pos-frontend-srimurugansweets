import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-date-picker";
import "../styles/cart.css";
import { useStoreState as useStoreStateDelivery } from "../reducers/deliveryReducer";
import CustomToast from "./CustomToast";
import { DropdownButton } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
import { Button, AutoComplete } from "antd";
import { EditOutlined } from "@ant-design/icons";
import history from "../history";
import { dispatch } from "../reducers/productReducer";
import { GET_ACTIVE_PRODUCTS } from "../actions/type";
import constants from "../constants";
import { set } from "lodash";
import { searchCustomersByMobileSvc } from "../actions/customerAction";
import CustomerEditDrawer from "./CustomerEditDrawer";

export const CartForm = (props) => {
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);

  const isOrderFromDelivery = useStoreStateDelivery("isOrderFromDelivery");
  const isOrderFromEdit = useStoreStateDelivery("isOrderFromEdit");
  const customerFromDelivery = useStoreStateDelivery("orderDetails").customer;
  const orderFromDelivery = useStoreStateDelivery("orderDetails").order;
  const [advPayment, setAdvPayment] = useState(0);
  const [totAmt, setTotAmt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const lastSearchedMobileRef = useRef("");
  const [customerRecord, setCustomerRecord] = useState(() => (isOrderFromDelivery || isOrderFromEdit ? customerFromDelivery : null));
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  const options = ["Morning", "Afternoon", "Evening", "Night"];

  const [state, setState] = useState({
    customerName: "",
    customerNumber: "",
    isDelivered: false,
    deliveryDate: new Date(),
    deliveryTime: "Morning",
    payment: "",
    notes: "",
    discount: "",
  });

  const paymentFunction = () => {
    setTotAmt(0);
    let advPay = isOrderFromDelivery || isOrderFromEdit ? orderFromDelivery.payment : advPayment;
    setAdvPayment(advPay);

    let t = 0;
    props.prodList.map((prod) => {
      if (prod.qty > 0) {
        t = prod.qty * prod.price + t;
      }
    });

    isOrderFromDelivery ? setTotAmt(orderFromDelivery.totalAmount) : setTotAmt(t);
    setState(() => ({
      ...state,
      totalAmount: t,
    }));

    console.log("state1", state);
    if (isOrderFromDelivery) {
      console.log("isOrderFromDelivery", state);
      setState(() => ({
        ...state,
        payment: orderFromDelivery.totalAmount - orderFromDelivery.payment,
        customerName: customerFromDelivery.name,
        customerNumber: customerFromDelivery.mobile,
        deliveryDate: new Date(),
        deliveryTime: orderFromDelivery.deliveryTime,
        isDelivered: true,
        notes: orderFromDelivery.notes,
        advPayment: orderFromDelivery.payment,
        discount: 0,
      }));
    } else if (isOrderFromEdit) {
      console.log("isOrderFromEdit", state);
      setState(() => ({
        ...state,
        payment: 0,
        customerName: customerFromDelivery.name,
        customerNumber: customerFromDelivery.mobile,
        deliveryDate: new Date(),
        deliveryTime: orderFromDelivery.deliveryTime,
        isDelivered: false,
        notes: orderFromDelivery.notes,
        discount: 0,
        advPayment: orderFromDelivery.payment,
        totalAmount: orderFromDelivery.totalAmount,
      }));
    }
    console.log("state2", state);
    // else{
    //   setState(()=>({
    //     ...state,
    //     payment: t,
    //   }));
    // }
  };

  useEffect(() => {
    paymentFunction();
  }, []);

  const handleChangeMobile = (value) => {
    setState(() => ({
      ...state,
      customerNumber: value,
    }));

    if (value.length !== 10) {
      setCustomerOptions([]);
      return;
    }

    lastSearchedMobileRef.current = value;
    searchCustomersByMobileSvc(value)
      .then((res) => {
        if (lastSearchedMobileRef.current !== value) return; // stale response, input has since changed
        const matches = res.data || [];
        setCustomerOptions(
          matches.map((customer) => ({
            key: customer.id,
            value: customer.mobile.toString(),
            label: `${customer.mobile} - ${customer.name}`,
            customer,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSelectCustomer = (value, option) => {
    setState(() => ({
      ...state,
      customerNumber: option.customer.mobile.toString(),
      customerName: option.customer.name,
    }));
    setCustomerRecord(option.customer);
  };

  const handleCustomerSaved = (updatedCustomer) => {
    setCustomerRecord(updatedCustomer);
    setState(() => ({
      ...state,
      customerName: updatedCustomer.name,
      customerNumber: updatedCustomer.mobile.toString(),
    }));
  };

  const handleChangeName = () => {
    const { name, value } = ref2.current;
    setState(() => ({
      ...state,
      [name]: value,
    }));
  };

  const handleChangePayment = () => {
    const { name, value } = ref4.current;
    setState(() => ({
      ...state,
      [name]: value,
    }));
    console.log("state1", state);
  };

  const handleChangeDiscount = () => {
    const { name, value } = ref5.current;
    setState(() => ({
      ...state,
      [name]: value,
    }));
  };

  const handleChangeNotes = () => {
    const { name, value } = ref6.current;
    setState(() => ({
      ...state,
      [name]: value,
    }));
  };

  const handleChangeDate = (e) => {
    setState({
      ...state,
      deliveryDate: e,
    });
  };

  const handleChangeCheckbox = (e) => {
    const name = e.target.name;

    if (state.totalAmount === undefined) {
      state.totalAmount = 0;
    }
    if (state.advPayment === undefined) {
      state.advPayment = 0;
    }

    setState(() => ({
      ...state,
      [name]: !state.isDelivered,
      payment: parseInt(state.totalAmount) - parseInt(state.advPayment),
    }));
    console.log("state", state);
  };

  const handleSelect = (eventKey) => {
    setState(() => ({
      ...state,
      deliveryTime: options[eventKey],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleSubmitOrder = () => {
    // Guard against double submission (e.g. double-clicking the button)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // console.log("Delivered", state.isDelivered);
    // console.log("OrderId", orderFromDelivery);
    if (state.payment === "") state.payment = "0";
    if (state.discount === "") state.discount = "0";
    // if (state.isDelivered === true && !isOrderFromDelivery) {
    //   state.payment = totAmt;
    // }
    console.log(totAmt, state.payment, advPayment);
    let orderResult;
    if (state.isDelivered) {
      console.log(totAmt, advPayment + parseInt(state.payment) + parseInt(state.discount));
      if (totAmt === advPayment + parseInt(state.payment) + parseInt(state.discount)) {
        state.payment = advPayment + parseInt(state.payment);
        orderResult = orderFromDelivery?.id ? props.createOrder(state, orderFromDelivery.id) : props.createOrder(state, 0);
      } else {
        CustomToast("error", "Please check the payment");
      }
    } else if (isOrderFromEdit) {
      if (totAmt >= advPayment + parseInt(state.payment) + parseInt(state.discount)) {
        state.payment = advPayment + parseInt(state.payment);
        orderResult = props.createOrder(state, orderFromDelivery.id);
      } else {
        CustomToast("error", "Please check the payment");
      }
    } else {
      orderResult = props.createOrder(state, 0);
    }

    Promise.resolve(orderResult).finally(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    });

    setTimeout(() => {
      setState(() => ({
        customerName: "",
        customerNumber: "",
        isDelivered: false,
        deliveryDate: new Date(),
        deliveryTime: "Morning",
        payment: "",
        notes: "",
        discount: 0,
      }));
    }, 3000);
  };

  const clearOrder = () => {
    props.prodList.map((prod) => {
      prod.qty = 0;
    });
    dispatch({
      payload: props.prodList,
      type: GET_ACTIVE_PRODUCTS,
    });

    setState(() => ({
      customerName: "",
      customerNumber: "",
      isDelivered: false,
      deliveryDate: new Date(),
      deliveryTime: "Morning",
      payment: "",
      notes: "",
      discount: 0,
    }));
  };

  const handleCancelOrder = () => {
    clearOrder();
    history.push("/order");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Customer Mobile number</label>
              {isOrderFromDelivery || isOrderFromEdit ? (
                <input type="number" name="customerNumber" required className="form-control" value={state.customerNumber} readOnly />
              ) : (
                <AutoComplete
                  className="w-100"
                  options={customerOptions}
                  value={state.customerNumber}
                  onSearch={handleChangeMobile}
                  onChange={handleChangeMobile}
                  onSelect={handleSelectCustomer}
                  filterOption={false}
                >
                  <input
                    type="number"
                    onWheel={(e) => {
                      e.currentTarget.blur();
                    }}
                    name="customerNumber"
                    required
                    className="form-control"
                  />
                </AutoComplete>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Customer Name</label>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  name="customerName"
                  ref={ref2}
                  className="form-control"
                  value={state.customerName}
                  onChange={handleChangeName}
                  readOnly={isOrderFromDelivery || isOrderFromEdit ? true : false}
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  className="ml-2"
                  disabled={!customerRecord?.id}
                  title="Edit customer info"
                  onClick={() => setShowEditDrawer(true)}
                />
              </div>
            </div>
          </div>
          {!isOrderFromDelivery && (
            <div className="col-md-6">
              <div className="form-group">
                <label for="isDelivery"> Delivery </label>
                <br />
                <input type="checkbox" value="isDelivered" name="isDelivered" ref={ref3} checked={state.isDelivered} onChange={handleChangeCheckbox} />
              </div>
            </div>
          )}
          {!state.isDelivered && !isOrderFromDelivery && (
            <div className="col-md-6">
              <div className="form-group">
                <label>Delivery Date</label>
                <br />
                <DatePicker onChange={handleChangeDate} value={state.deliveryDate} name="deliveryDate" className="input-group date" clearIcon={null} />
              </div>
            </div>
          )}
          {!state.isDelivered && !isOrderFromDelivery && (
            <div className="col-md-6">
              <div className="form-group">
                <label>Delivery time</label>
                <br />
                <DropdownButton readOnly={isOrderFromDelivery ? true : false} title={state.deliveryTime} onSelect={handleSelect}>
                  {options.map((opt, i) => (
                    <Dropdown.Item key={i} eventKey={i}>
                      {opt}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
            </div>
          )}
          {(isOrderFromDelivery || isOrderFromEdit) && (
            <div className="col-md-6">
              <div className="form-group">
                <label> Advance Payment</label>
                <br />
                <input
                  type="number"
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  name="advancePayment"
                  className="form-control"
                  value={state.advPayment}
                  readOnly={true}
                />
              </div>
            </div>
          )}

          <div className="col-md-6">
            <div className="form-group">
              <label>Payment</label>
              <input
                type="number"
                onWheel={(e) => {
                  e.currentTarget.blur();
                }}
                name="payment"
                ref={ref4}
                className="form-control"
                value={state.payment}
                onChange={handleChangePayment}
              />
            </div>
          </div>
          {constants.IS_SHOW_DISCOUNT && (
            <div className="col-md-6">
              <div className="form-group">
                <label>Discount Amount</label>
                <input
                  type="number"
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  ref={ref5}
                  name="discount"
                  className="form-control"
                  value={state.discount}
                  onChange={handleChangeDiscount}
                />
              </div>
            </div>
          )}
          <div className="col-md-6">
            <div className="form-group">
              <label>Notes</label>
              <textarea type="textarea" name="notes" ref={ref6} rows="4" className="form-control" defaultValue={state.notes} onChange={handleChangeNotes} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <button className="btn btn-secondary" type="button" onClick={handleCancelOrder} disabled={isSubmitting}>
                Cancel Order
              </button>
              &nbsp;&nbsp;
              <Button type="primary" htmlType="submit" onClick={handleSubmitOrder} loading={isSubmitting} disabled={isSubmitting}>
                Submit Order
              </Button>
            </div>
          </div>
        </div>
      </form>
      <CustomerEditDrawer open={showEditDrawer} customer={customerRecord} onClose={() => setShowEditDrawer(false)} onSaved={handleCustomerSaved} />
    </div>
  );
};
