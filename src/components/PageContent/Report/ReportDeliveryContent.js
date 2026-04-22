import React, { useState,useRef, useEffect } from "react";
import DatePicker from "react-date-picker";
import { deliveryReport } from "../../../actions/reportAction";
import printJS from 'print-js';
import PrintHeaderFooter from "../../../textFiles/PrintHeaderFooter.txt";
import PrintDeliveryReportTableHeader from "../../../textFiles/PrintDeliveryReportTableHeader.txt";
import PrintDeliveryReportTableContent from "../../../textFiles/PrintDeliveryReportTableContent.txt";
import { concat } from "lodash";
import CustomToast from '../../CustomToast';

const ReportDeliveryContent = () => {

  const myGrid = useRef(null);
  var past = new Date();
  past.setDate(past.getDate()-30);
  const [report,setReport] = useState([]);
  const [state, setState] = useState({
    fromDate: past,
    toDate: new Date(),
  });

  useEffect(
    ()=>{
    getReport();
    },[]);

  
  const handleChangeFromDate = (e) => {
    setState({
      ...state,
      fromDate: e,
    });
  };

  const handleChangeToDate = (e) => {
    setState({
      ...state,
      toDate: e,
    });
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
        <div className="card card-default">
          <div className="card-header">
            <h3 className="card-title">Apply Filter</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>From Date</label>
                  <DatePicker
                    onChange={handleChangeFromDate}
                    value={state.fromDate}
                    name="fromDate"
                    className="input-group date"
                    clearIcon={null}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">

                  <label>To Date</label>
                  <DatePicker
                    onChange={handleChangeToDate}
                    className="input-group date"
                    value={state.toDate}
                    name="toDate"
                    clearIcon={null}
                  />
                </div>
                <div className="form-group">
                </div>
              </div>
            </div>
            <div className="row">
            <div className="form-group">
                  <button className="btn btn-primary" onClick={getReport}>Get Report</button>
                  &nbsp;&nbsp;
                  <button className="btn btn-secondary" onClick={printReport}>Print</button>
              </div>
            </div>
          </div>
        </div>


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