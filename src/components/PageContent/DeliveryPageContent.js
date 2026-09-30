import React, { useState, useRef } from "react";
import "../../styles/delivery.css";
import { getOrderDetailsSvc, getSearchResultSvc } from "../../actions/deliveryAction";
import CustomToast from "../CustomToast";
import QrScannerModal from "../QrScannerModal";
import { ScanOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { GET_ORDER_DETAILS } from "../../actions/type";
import { dispatch } from "../../reducers/deliveryReducer";

const DeliveryPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(null);
  const [resultCount, setResultCount] = useState(0);
  const myGrid = useRef(null);
  const history = useHistory();

  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleScan = (text) => {
    setSearchTerm(text);
    runSearch(text);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;
    runSearch(searchTerm.trim());
  };

  const runSearch = (term) => {
    setLoading(true);
    getSearchResultSvc(term)
      .then((res) => {
        if (res.status == 200) {
          setSearched(term);
          setResultCount(res.data.length);
          loadSearchResult(res.data);
        }
      })
      .catch((error) => {
        CustomToast("error", "Try again");
        console.log(error);
      })
      .finally(() => setLoading(false));
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
            isOrderFromDelivery: true,
            isOrderFromEdit: false,
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
              <h1>Delivery</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Delivery</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="card dl-card">
          <div className="card-body">
            <form className="dl-search" onSubmit={handleSearchSubmit}>
              <label className="dl-label" htmlFor="dl-search-input">
                Find an order
              </label>
              <div className="dl-field">
                <SearchOutlined className="dl-field-icon" />
                <input
                  id="dl-search-input"
                  type="text"
                  inputMode="search"
                  name="searchTerm"
                  autoComplete="off"
                  autoFocus
                  className="dl-input"
                  value={searchTerm}
                  onChange={handleSearchTerm}
                  placeholder="Mobile number or order id"
                />
                <button type="button" className="dl-scan" title="Scan order QR code" aria-label="Scan order QR code" onClick={() => setShowScanner(true)}>
                  <ScanOutlined />
                  <span>Scan</span>
                </button>
                <button type="submit" className="dl-submit" disabled={loading || searchTerm.trim() === ""}>
                  {loading ? <LoadingOutlined /> : "Search"}
                </button>
              </div>
              <p className="dl-hint">Type a 10-digit mobile number or an order id, or scan the QR code printed on the slip.</p>
            </form>
          </div>
        </div>

        <div className="card dl-card">
          <div className="dl-results-head">
            <h3 className="dl-results-title">Orders</h3>
            {searched !== null && (
              <span className="dl-results-meta">
                {resultCount} {resultCount === 1 ? "match" : "matches"} for <strong>{searched}</strong>
              </span>
            )}
          </div>
          {searched === null && (
            <div className="dl-empty">
              <ScanOutlined className="dl-empty-icon" />
              <p className="dl-empty-title">No search yet</p>
              <p className="dl-empty-text">Results will appear here.</p>
            </div>
          )}
          {searched !== null && resultCount === 0 && (
            <div className="dl-empty">
              <SearchOutlined className="dl-empty-icon" />
              <p className="dl-empty-title">No orders found</p>
              <p className="dl-empty-text">Check the number and try again.</p>
            </div>
          )}
          <div className="dl-grid" style={{ display: resultCount > 0 ? "block" : "none" }}>
            <div id="jsGrid1" ref={myGrid}></div>
          </div>
        </div>
      </section>
      <QrScannerModal open={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />
    </div>
  );
};

export default DeliveryPageContent;
