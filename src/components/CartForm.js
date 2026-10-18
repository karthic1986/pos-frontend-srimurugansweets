import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-date-picker";
import "../styles/cart.css";
import { useStoreState as useStoreStateDelivery } from "../reducers/deliveryReducer";
import CustomToast from "./CustomToast";
import { Button, AutoComplete, Segmented, Popconfirm, ConfigProvider } from "antd";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import history from "../history";
import { dispatch } from "../reducers/productReducer";
import { GET_ACTIVE_PRODUCTS } from "../actions/type";
import constants from "../constants";
import { searchCustomersByMobileSvc } from "../actions/customerAction";
import CustomerEditDrawer from "./CustomerEditDrawer";
import { getAppSettingsMap, isThermalPrintEnabled } from "../actions/appSettingAction";

// antd controls on this screen use the bill pad's accent and radius (cart.css).
const CHECKOUT_THEME = { token: { colorPrimary: "#0d6efd", borderRadius: 8, fontFamily: "inherit" } };

const DELIVERY_TIMES = ["Morning", "Afternoon", "Evening", "Night"];

const toNumber = (value) => Number(value) || 0;
// Round to paise so fractional prices can't leave a stray 0.0000001 balance.
const toPaise = (value) => Math.round(value * 100) / 100;
// Indian digit grouping, e.g. ₹1,23,456
const rupees = (value) => `₹${toNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const blurOnWheel = (e) => e.currentTarget.blur();

export const CartForm = (props) => {
  const ref2 = useRef(null);
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
  // Thermal printer or this PC's printer (print dialog). Defaults to the
  // thermal printer unless the THERMAL_PRINT_ENABLED setting is "false".
  const [printOnThermal, setPrintOnThermal] = useState(true);
  const printChoiceTouchedRef = useRef(false);

  useEffect(() => {
    getAppSettingsMap()
      .then((settings) => {
        if (!printChoiceTouchedRef.current) setPrintOnThermal(isThermalPrintEnabled(settings));
      })
      .catch((error) => console.log(error));
  }, []);

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

    if (isOrderFromDelivery) {
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

  const handleChangePayment = (e) => {
    const { value } = e.target;
    setState((prev) => ({ ...prev, payment: value }));
  };

  const handleChangeDiscount = (e) => {
    const { value } = e.target;
    setState((prev) => ({ ...prev, discount: value }));
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
  };

  // "Deliver now" = the old Delivery checkbox ticked.
  const handleChangeHandover = (value) => {
    if ((value === "now") !== state.isDelivered) handleChangeCheckbox({ target: { name: "isDelivered" } });
  };

  const handleChangeDeliveryTime = (value) => {
    setState((prev) => ({ ...prev, deliveryTime: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const isMobileValid = String(state.customerNumber ?? "").trim().length === 10;

  const handleSubmitOrder = () => {
    if (!isMobileValid) {
      CustomToast("error", "Please enter a valid 10 digit mobile number");
      return;
    }
    // Guard against double submission (e.g. double-clicking the button)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (state.payment === "") state.payment = "0";
    if (state.discount === "") state.discount = "0";
    let orderResult;
    if (state.isDelivered) {
      if (totAmt === advPayment + parseInt(state.payment) + parseInt(state.discount)) {
        state.payment = advPayment + parseInt(state.payment);
        orderResult = props.createOrder(state, orderFromDelivery?.id ? orderFromDelivery.id : 0, printOnThermal);
      } else {
        CustomToast("error", "Please check the payment");
      }
    } else if (isOrderFromEdit) {
      if (totAmt >= advPayment + parseInt(state.payment) + parseInt(state.discount)) {
        state.payment = advPayment + parseInt(state.payment);
        orderResult = props.createOrder(state, orderFromDelivery.id, printOnThermal);
      } else {
        CustomToast("error", "Please check the payment");
      }
    } else {
      orderResult = props.createOrder(state, 0, printOnThermal);
    }

    // On success CartContent prints and leaves this page; on failure the
    // cashier's entries stay so they can fix the payment and resubmit.
    Promise.resolve(orderResult).finally(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    });
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

  // Bill figures. totAmt is the order total (the saved total when delivering).
  const items = props.prodList.filter((prod) => prod.qty > 0);
  const itemCount = items.reduce((sum, prod) => sum + toNumber(prod.qty), 0);
  const paidEarlier = toNumber(advPayment);
  const discount = toNumber(state.discount);
  const payingNow = toNumber(state.payment);
  const amountDue = toPaise(totAmt - paidEarlier - discount);
  const balance = toPaise(amountDue - payingNow);

  let balanceStatus;
  let balanceHint;
  if (balance === 0) {
    balanceStatus = "paid";
    balanceHint = "Paid in full";
  } else if (balance < 0) {
    balanceStatus = "over";
    balanceHint = `Paying ${rupees(-balance)} more than the bill`;
  } else if (state.isDelivered) {
    balanceStatus = "short";
    balanceHint = `Collect ${rupees(balance)} more to deliver now`;
  } else {
    balanceStatus = "due";
    balanceHint = "Due on delivery";
  }

  const isCustomerLocked = isOrderFromDelivery || isOrderFromEdit;
  const showSchedule = !state.isDelivered && !isOrderFromDelivery;

  return (
    <ConfigProvider theme={CHECKOUT_THEME}>
      <form className="checkout" onSubmit={handleSubmit}>
        <section className="co-panel" aria-labelledby="co-customer-title">
          <header className="co-panel-head">
            <h2 className="co-title" id="co-customer-title">
              Customer
            </h2>
          </header>
          <div className="co-panel-body">
            <div className="co-field-row">
              <div className="co-field co-mobile">
                <label className="co-label" htmlFor="co-mobile">
                  Mobile number
                </label>
                {isCustomerLocked ? (
                  <input id="co-mobile" type="number" name="customerNumber" className="form-control co-input co-input-hero" value={state.customerNumber} readOnly />
                ) : (
                  <AutoComplete
                    id="co-mobile"
                    className="w-100"
                    options={customerOptions}
                    value={state.customerNumber}
                    onSearch={handleChangeMobile}
                    onChange={handleChangeMobile}
                    onSelect={handleSelectCustomer}
                    filterOption={false}
                    autoFocus
                  >
                    <input
                      id="co-mobile"
                      type="number"
                      inputMode="numeric"
                      onWheel={blurOnWheel}
                      name="customerNumber"
                      required
                      placeholder="10-digit mobile"
                      className="form-control co-input co-input-hero"
                    />
                  </AutoComplete>
                )}
                {state.customerNumber !== "" && !isMobileValid && <p className="co-error">Mobile number must be 10 digits</p>}
              </div>

              <div className="co-field co-name">
                <label className="co-label" htmlFor="co-name">
                  Name
                </label>
                <div className="co-input-row">
                  <input
                    id="co-name"
                    type="text"
                    name="customerName"
                    ref={ref2}
                    className="form-control co-input co-input-tall"
                    value={state.customerName}
                    onChange={handleChangeName}
                    readOnly={isCustomerLocked}
                  />
                  <Button
                    type="text"
                    size="large"
                    icon={<EditOutlined />}
                    disabled={!customerRecord?.id}
                    title="Edit customer info"
                    aria-label="Edit customer info"
                    onClick={() => setShowEditDrawer(true)}
                  />
                </div>
              </div>
            </div>

            {!isOrderFromDelivery && (
              <div className="co-field">
                <span className="co-label" id="co-handover-label">
                  Delivery
                </span>
                <Segmented
                  block
                  size="large"
                  aria-labelledby="co-handover-label"
                  options={[
                    { label: "Deliver now", value: "now" },
                    { label: "Deliver later", value: "later" },
                  ]}
                  value={state.isDelivered ? "now" : "later"}
                  onChange={handleChangeHandover}
                />
                <p className="co-hint">
                  {state.isDelivered ? "Customer takes the items now. Collect the full amount." : "Advance order. Choose when it will be delivered."}
                </p>
              </div>
            )}

            {showSchedule && (
              <div className="co-field-row">
                <div className="co-field co-date">
                  <span className="co-label">Delivery date</span>
                  <DatePicker onChange={handleChangeDate} value={state.deliveryDate} name="deliveryDate" clearIcon={null} format="dd-MM-y" />
                </div>
                <div className="co-field co-time">
                  <span className="co-label" id="co-time-label">
                    Delivery time
                  </span>
                  <Segmented block size="large" aria-labelledby="co-time-label" options={DELIVERY_TIMES} value={state.deliveryTime} onChange={handleChangeDeliveryTime} />
                </div>
              </div>
            )}

            <div className="co-field">
              <label className="co-label" htmlFor="co-notes">
                Notes <span className="co-optional">optional</span>
              </label>
              <textarea
                id="co-notes"
                name="notes"
                ref={ref6}
                rows="3"
                className="form-control co-input"
                value={state.notes || ""}
                onChange={handleChangeNotes}
                placeholder="e.g. less sugar, gift pack"
              />
            </div>
          </div>
        </section>

        <aside className="co-panel co-bill" aria-labelledby="co-bill-title">
          <header className="co-panel-head">
            <h2 className="co-title" id="co-bill-title">
              Bill
            </h2>
            {!isOrderFromDelivery && (
              <Link to="/order" className="co-link">
                <ArrowLeftOutlined /> Add items
              </Link>
            )}
          </header>

          <ul className="bill-items">
            {items.map((prod) => (
              <li key={prod.id} className="bill-item">
                <span className="bill-item-name">{prod.name}</span>
                <span className="bill-item-amount">{rupees(prod.qty * prod.price)}</span>
                <span className="bill-item-meta">
                  {prod.qty} × {rupees(prod.price)}
                </span>
              </li>
            ))}
            {items.length === 0 && <li className="bill-empty">No items in this order.</li>}
          </ul>

          <div className="bill-rule" aria-hidden="true" />
          <div className="bill-line bill-line-total">
            <span>
              Total · {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span>{rupees(totAmt)}</span>
          </div>
          {paidEarlier > 0 && (
            <div className="bill-line">
              <span>Paid earlier</span>
              <span>− {rupees(paidEarlier)}</span>
            </div>
          )}

          {constants.IS_SHOW_DISCOUNT && (
            <div className="co-field bill-pay">
              <label className="co-label" htmlFor="co-discount">
                Discount
              </label>
              <div className="co-money">
                <span className="co-money-prefix">₹</span>
                <input
                  id="co-discount"
                  type="number"
                  inputMode="decimal"
                  onWheel={blurOnWheel}
                  name="discount"
                  className="form-control co-input co-input-money"
                  value={state.discount}
                  onChange={handleChangeDiscount}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="co-field bill-pay">
            <label className="co-label" htmlFor="co-payment">
              Paying now
            </label>
            <div className="co-input-row">
              <div className="co-money">
                <span className="co-money-prefix">₹</span>
                <input
                  id="co-payment"
                  type="number"
                  inputMode="decimal"
                  onWheel={blurOnWheel}
                  name="payment"
                  className="form-control co-input co-input-money"
                  value={state.payment}
                  onChange={handleChangePayment}
                  placeholder="0"
                />
              </div>
              {amountDue > 0 && payingNow !== amountDue && (
                <Button size="large" className="bill-full" onClick={() => setState((prev) => ({ ...prev, payment: String(amountDue) }))}>
                  Full {rupees(amountDue)}
                </Button>
              )}
            </div>
          </div>

          <div className="bill-rule" aria-hidden="true" />
          <div className={`bill-balance is-${balanceStatus}`} aria-live="polite">
            <span className="bill-balance-label">Balance</span>
            <span className="bill-balance-amount">{rupees(Math.abs(balance))}</span>
            <span className="bill-balance-hint">{balanceHint}</span>
          </div>

          <div className="co-field bill-print">
            <span className="co-label" id="co-print-label">
              Print on
            </span>
            <Segmented
              block
              aria-labelledby="co-print-label"
              options={[
                { label: "Thermal printer", value: "thermal" },
                { label: "This PC", value: "pc" },
              ]}
              value={printOnThermal ? "thermal" : "pc"}
              onChange={(value) => {
                printChoiceTouchedRef.current = true;
                setPrintOnThermal(value === "thermal");
              }}
            />
          </div>

          <div className="bill-actions">
            <Button
              className="bill-submit"
              type="primary"
              size="large"
              block
              htmlType="submit"
              onClick={handleSubmitOrder}
              loading={isSubmitting}
              disabled={isSubmitting || !isMobileValid}
            >
              {payingNow > 0 ? `Submit · collect ${rupees(payingNow)}` : "Submit order"}
            </Button>
            {!isMobileValid && <p className="co-hint co-hint-center">Enter the customer's 10-digit mobile number to submit.</p>}
            <Popconfirm
              title="Cancel this order?"
              description="The items in the cart will be cleared."
              okText="Cancel order"
              okButtonProps={{ danger: true }}
              cancelText="Keep order"
              onConfirm={handleCancelOrder}
              disabled={isSubmitting}
            >
              <Button type="text" block className="bill-cancel" disabled={isSubmitting}>
                Cancel order
              </Button>
            </Popconfirm>
          </div>
        </aside>
      </form>
      <CustomerEditDrawer open={showEditDrawer} customer={customerRecord} onClose={() => setShowEditDrawer(false)} onSaved={handleCustomerSaved} />
    </ConfigProvider>
  );
};
