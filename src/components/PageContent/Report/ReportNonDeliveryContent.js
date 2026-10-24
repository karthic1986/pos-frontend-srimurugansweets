import React, { useState, useRef, useEffect } from "react";
import { nondeliveryReport, nondeliveryReportByProduct } from "../../../actions/reportAction";
import printJS from "print-js";
import PrintHeaderFooter from "../../../textFiles/PrintHeaderFooter.txt";
import { concat } from "lodash";
import CustomToast from "../../CustomToast";
import moment from "moment";
import { savedFromDate, saveFromDate } from "../../../reportFromDate";
import ReportFilter, { ReportFilterField } from "./ReportFilter";
import { Segmented, Switch } from "antd";
const ReportNonDeliveryContent = () => {
  const myGrid = useRef(null);
  var past = new Date();
  past.setDate(past.getDate() - 365);
  const [report, setReport] = useState([]);
  const [state, setState] = useState({
    fromDate: savedFromDate("nonDelivery", past),
    toDate: new Date(),
  });
  const [showAmount, setShowAmount] = useState(false);
  const [reportType, setReportType] = useState("customer");

  useEffect(() => {
    getReport();
  }, []);

  const handleChangeFromDate = (e) => {
    saveFromDate("nonDelivery", e);
    setState((s) => ({
      ...s,
      fromDate: e,
    }));
  };

  const handleChangeToDate = (e) => {
    setState((s) => ({
      ...s,
      toDate: e,
    }));
  };

  async function getReport() {
    if (reportType === "product") {
      let res = await nondeliveryReportByProduct(state);
      if (res.data !== null) {
        setReport(res.data);

        let fields = [
          { name: "productId", type: "text", title: "Product Id" },
          { name: "name", type: "text", title: "Product Name" },
          { name: "totalQty", type: "number", title: "Qty" },
        ];
        if (showAmount) {
          fields.push({ name: "totalAmount", type: "number", title: "Total Amount" });
        }

        window.jQuery(myGrid.current).jsGrid({
          height: "auto",
          width: "100%",
          sorting: true,
          paging: true,
          data: res.data,
          fields,
        });
      } else {
        CustomToast("error", "Try again");
        console.log(res.status);
      }
    } else {
      let res = await nondeliveryReport(state);
      if (res.data !== null) {
        //let tableContent = [];
        res.data.map((d) => {
          d.orderDate = moment(d.orderDate).format("DD-MM-YYYY");
          d.deliveryDate = moment(d.deliveryDate).format("DD-MM-YYYY");
        });

        setReport(res.data);

        let fields = [
          { name: "orderId", type: "text", title: "Order Id" },
          { name: "name", type: "text", title: "Customer Name" },
          { name: "mobile", type: "number", title: "Mobile" },
          { name: "orderDate", type: "date", title: "Order Date" },
          { name: "deliveryDate", type: "date", title: "Delivery Date" },
          { name: "totalQty", type: "number", title: "Qty" },
        ];
        if (showAmount) {
          fields.push({ name: "totalAmount", type: "number", title: "Total Amount" }, { name: "payment", type: "number", title: "Paid" }, { name: "balance", type: "number", title: "Balance Amount" });
        }

        window.jQuery(myGrid.current).jsGrid({
          height: "auto",
          width: "100%",
          sorting: true,
          paging: true,
          data: res.data,
          fields,
        });
      } else {
        CustomToast("error", "Try again");
        console.log(res.status);
      }
    }
  }

  const printReport = async () => {
    const response = await fetch(PrintHeaderFooter);
    let htmlHeaderFooter = await response.text();

    const reportTitle = reportType === "product" ? "Non-Delivery Report (Product Wise)" : "Non-Delivery Report";
    htmlHeaderFooter = htmlHeaderFooter.replace("{{TableName}}", reportTitle);

    let headerCols;
    let rows = [];

    if (reportType === "product") {
      headerCols = ["Product Id", "Product Name", "Qty"];
      if (showAmount) {
        headerCols.push("Total Amount");
      }

      report.map((item) => {
        let cols = [item.productId, item.name, item.totalQty];
        if (showAmount) {
          cols.push(item.totalAmount);
        }
        rows.push(cols);
      });
    } else {
      headerCols = ["Order Id", "Name", "Mobile", "Order Date", "Delivery Date", "Qty"];
      if (showAmount) {
        headerCols.push("Total Amount", "Paid", "Balance");
      }

      report.map((item) => {
        let cols = [item.orderId, item.name, item.mobile, item.orderDate, item.deliveryDate, item.totalQty];
        if (showAmount) {
          cols.push(item.totalAmount, item.payment, item.balance);
        }
        rows.push(cols);
      });
    }

    const headerHtml = "<tr>" + headerCols.map((col) => `<th>${col}</th>`).join("") + "</tr>";
    const rowsHtml = rows
      .map((cols) => "<tr>" + cols.map((val, i) => `<td style="text-align:${i === 1 ? "left" : "right"}">${val}</td>`).join("") + "</tr>")
      .join("");

    const htmlPrintData = htmlHeaderFooter.replace("{{TableContent}}", headerHtml + rowsHtml);

    printJS({
      printable: htmlPrintData,
      type: "raw-html",
      targetStyles: ["*"],
      honorColor: true,
      scanStyles: true,
    });
  };

  return (
    // <!-- Content Wrapper. Contains page content -->
    <div className="content-wrapper">
      {/* <!-- Content Header (Page header) --> */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Non-Delivery Report</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Report</li>
                <li className="breadcrumb-item active">Delivery Report</li>
              </ol>
            </div>
          </div>
        </div>
        {/* <!-- /.container-fluid --> */}
      </section>

      {/* <!-- Main content --> */}
      <section className="content">
        <ReportFilter
          fromDate={state.fromDate}
          toDate={state.toDate}
          onFromDateChange={handleChangeFromDate}
          onToDateChange={handleChangeToDate}
          onGetReport={getReport}
          onPrint={printReport}
        >
          <ReportFilterField label="Report Type">
            <Segmented
              size="large"
              options={[
                { label: "Customer Wise", value: "customer" },
                { label: "Product Wise", value: "product" },
              ]}
              value={reportType}
              onChange={setReportType}
            />
          </ReportFilterField>
          <label className="rf-toggle">
            <Switch checked={showAmount} onChange={setShowAmount} />
            Show Amount
          </label>
        </ReportFilter>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Report</h3>
          </div>
          {/* <!-- /.card-header --> */}
          <div className="card-body">
            {/* <button className="btn btn-secondary" onClick={printReport}>
              Print
            </button> */}
            <br />
            <br />
            <div id="jsGrid1" ref={myGrid}></div>
          </div>
          {/* <!-- /.card-body --> */}
        </div>
        {/* <!-- /.card --> */}
      </section>
      {/* <!-- /.content --> */}
    </div>
    // <!-- /.content-wrapper -->
  );
};

export default ReportNonDeliveryContent;

// console.log(state);
// printJS({
//   printable: report,
//   type: 'json',
//   properties: [
//     { field: 'productId', displayName: 'Product ID' },
//     { field: 'name', displayName: 'Name' },
//     { field: 'orderQty', displayName: 'Order Qty' },
//     { field: 'deliveredQty', displayName: 'Delivery Qty' },
//     { field: 'pendingQty', displayName: 'Pending Qty' }
//   ],
//   header: '<h3 className="custom-h3">My custom header</h3>',
//   style: '.custom-h3 { color: red; }'
// });
