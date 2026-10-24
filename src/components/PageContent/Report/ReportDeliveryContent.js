import React, { useState,useRef, useEffect } from "react";
import { deliveryReport } from "../../../actions/reportAction";
import printJS from 'print-js';
import PrintHeaderFooter from "../../../textFiles/PrintHeaderFooter.txt";
import PrintDeliveryReportTableHeader from "../../../textFiles/PrintDeliveryReportTableHeader.txt";
import PrintDeliveryReportTableContent from "../../../textFiles/PrintDeliveryReportTableContent.txt";
import { concat } from "lodash";
import CustomToast from '../../CustomToast';
import { savedFromDate, saveFromDate } from "../../../reportFromDate";
import ReportFilter from "./ReportFilter";

const ReportDeliveryContent = () => {

  const myGrid = useRef(null);
  var past = new Date();
  past.setDate(past.getDate()-30);
  const [report,setReport] = useState([]);
  const [state, setState] = useState({
    fromDate: savedFromDate("delivery", past),
    toDate: new Date(),
  });

  useEffect(
    ()=>{
    getReport();
    },[]);

  
  const handleChangeFromDate = (e) => {
    saveFromDate("delivery", e);
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
    let res = await deliveryReport(state);
        if(res.data!==null){
          setReport(res.data);
          window.jQuery(myGrid.current).jsGrid({
            height: "auto",
            width: "100%",
            sorting: true,
            paging: true,
            data: res.data,
            fields: [
              { name: "productId", type: "text", title: "Product Code" },
              { name: "name", type: "text", title: "Name" },
              { name: "orderQty", type: "number", title: "Order Qty" },
              { name: "deliveredQty", type: "number", title: "Delivery Qty" },
              { name: "pendingQty", type: "number", title: "Pending Qty" }
            ]
          });      
        }
        else{
          CustomToast("error", "Try again");
          console.log(res.status);  
        }
  }


  const printReport = async() => {
    let htmlPrintData = "";
    const response = await fetch(PrintHeaderFooter);
    let htmlHeaderFooter = await response.text();

    htmlHeaderFooter = htmlHeaderFooter.replace("{{TableName}}","Delivery Report");

    const tableHeaderResponse = await fetch(PrintDeliveryReportTableHeader);
    let htmlTableHeader = await tableHeaderResponse.text();

    htmlPrintData= htmlHeaderFooter.replace("{{TableContent}}",htmlTableHeader);

    let tableContent = "";
    const tableContentResponse = await fetch(PrintDeliveryReportTableContent);
    let htmlTableContent = await tableContentResponse.text();
    let DummyTableContent = htmlTableContent;

    report.map((item)=>{
      htmlTableContent = htmlTableContent.replace("{{ProdCode}}",item.productId);
      htmlTableContent = htmlTableContent.replace("{{ProdName}}",item.name);
      htmlTableContent = htmlTableContent.replace("{{OrderedQty}}",item.orderQty);
      htmlTableContent = htmlTableContent.replace("{{DeliveredQty}}",item.deliveredQty);
      htmlTableContent = htmlTableContent.replace("{{PendingQty}}",item.pendingQty);
      tableContent = tableContent + htmlTableContent;
      htmlTableContent = DummyTableContent;
    })

    htmlPrintData = htmlPrintData.replace("{{TableContent}}",tableContent);

    printJS({
      printable: htmlPrintData,
      type: "raw-html",
      targetStyles: ["*"],
      honorColor: true,
      scanStyles: true,
    });
  }

  return (
    // <!-- Content Wrapper. Contains page content -->
    <div className="content-wrapper">
      {/* <!-- Content Header (Page header) --> */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Delivery Report</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
              <li className="breadcrumb-item"><a href="#">Home</a></li>
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
        />

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Report</h3>
          </div>
          {/* <!-- /.card-header --> */}
          <div className="card-body">
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



export default ReportDeliveryContent;




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