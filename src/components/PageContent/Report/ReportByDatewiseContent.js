import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-date-picker";
import { reportByDatewise } from "../../../actions/reportAction";
import printJS from 'print-js';
import PrintHeaderFooter from "../../../textFiles/PrintHeaderFooter.txt";
import PrintDatewiseReportTableHeader from "../../../textFiles/PrintDatewiseReportTableHeader.txt";
import PrintDatewiseReportTableContent from "../../../textFiles/PrintDatewiseReportTableContent.txt";
import moment from "moment";
import CustomToast from '../../CustomToast';
import { GET_ORDER_DETAILS } from "../../../actions/type";
import { dispatch } from "../../../reducers/deliveryReducer";
import { getOrderDetailsSvc } from "../../../actions/deliveryAction";
import CustomPrintReport from "../../CustomPrintReport";
import { DropdownButton } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";

const ReportByDatewiseContent = () => {

    const myGrid = useRef(null);
    var past = new Date();
    past.setDate(past.getDate() - 30);
    const [report, setReport] = useState([]);
    const [state, setState] = useState({
        fromDate: past,
        toDate: new Date(),
        delivery: 'All',
    });

    let tableContent=[];
    const options = ["All", "Delivered", "Undelivered"];

    useEffect(
        () => {
            getReport();
        }, []);


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

    const handlePrintClick = (item) => {
        console.log(item);
        let orderId = item.orderId;
        let orderDetails = [];
        getOrderDetailsSvc(orderId)
            .then((res) => {
                if (res.status == 200) {
                    dispatch({
                        payload: res.data,
                        type: GET_ORDER_DETAILS,
                    });

                    console.log('res', res.data);
                    orderDetails = {
                        customerNumber: res.data.customer.mobile,
                        customerName: res.data.customer.name,
                        payment: res.data.order.payment,
                        totalQty: res.data.order.totalQty,
                        totalAmount: res.data.order.totalAmount,
                        orderDate: res.data.order.orderDate,
                        isDelivery: res.data.order.isDelivery,
                        deliveryTime: res.data.order.deliveryTime,
                        deliveryDate: res.data.order.deliveryDate,
                        notes: res.data.order.notes,
                        createdBy: 1,
                        updatedBy: 1,
                        id: res.data.order.id,
                        discount: res.data.order.Discount === "" ? 0 : res.data.order.Discount
                    };

                    //   console.log(orderDetails,orderId,productList);
                    CustomPrintReport(orderDetails, orderId, res.data.orderDetails);

                }
            })
            .catch((error) => {
                console.log(error);
                CustomToast(
                    "error",
                    "Failed to Load Order details. Please try again.."
                );
            });
    }

    async function getReport() {
        let res = await reportByDatewise(state);
        if (res.data !== null) {
            
            
            tableContent=[];
            res.data.map((d) => {
                d.orderDate = moment(d.orderDate).format("DD-MM-YYYY");
                d.isDelivery = d.isDelivery == 1 ? "Yes" : "No";
            });

            if (state.delivery === "All") {
                tableContent=res.data;
            }
            else if(state.delivery === "Delivered") {
                tableContent= res.data.filter(function(x) { return x.isDelivery ==="Yes"; });
            }
            else {
                tableContent= res.data.filter(function(x) { return x.isDelivery ==="No"; });
            }

            setReport(tableContent);
            
            window.jQuery(myGrid.current).jsGrid({
                height: "auto",
                width: "100%",
                sorting: true,
                paging: true,
                data: tableContent,
                fields: [
                    { name: "orderId", type: "number", title: "Order No" },
                    { name: "orderDate", type: "date", title: "Order Date" },
                    { name: "name", type: "text", title: "Name" },
                    { name: "mobile", type: "number", title: "Mobile" },
                    { name: "isDelivery", type: "boolean", title: "Delivered" },
                    { name: "totalQty", type: "number", title: "Qty" },
                    { name: "totalAmount", type: "number", title: "Amount" },
                    {
                        type: "control",
                        itemTemplate: function (value, item) {
                            var printBtn = $(
                                '<i class="fa fa-print"></i>'
                            ).on("click", function (e) {
                                handlePrintClick(item);
                            });
                            return printBtn;
                        },
                    },
                ]
            });
        }
        else {
            CustomToast("error", "Try again");
            console.log(res.status);
        }
    };


    const printReport = async () => {

        let htmlPrintData = "";
        const response = await fetch(PrintHeaderFooter);
        let htmlHeaderFooter = await response.text();

        htmlHeaderFooter = htmlHeaderFooter.replace("{{TableName}}", "Date Wise Sales Report");

        const tableHeaderResponse = await fetch(PrintDatewiseReportTableHeader);
        let htmlTableHeader = await tableHeaderResponse.text();

        htmlPrintData = htmlHeaderFooter.replace("{{TableContent}}", htmlTableHeader);

        let tableContent = "";
        const tableContentResponse = await fetch(PrintDatewiseReportTableContent);
        let htmlTableContent = await tableContentResponse.text();
        let DummyTableContent = htmlTableContent;

        report.map((item) => {
            htmlTableContent = htmlTableContent.replace("{{orderId}}", item.orderId);
            htmlTableContent = htmlTableContent.replace("{{orderDate}}", item.orderDate);
            htmlTableContent = htmlTableContent.replace("{{name}}", item.name);
            htmlTableContent = htmlTableContent.replace("{{mobile}}", item.mobile);
            htmlTableContent = htmlTableContent.replace("{{isDelivery}}", item.isDelivery);
            htmlTableContent = htmlTableContent.replace("{{qty}}", item.totalQty);
            htmlTableContent = htmlTableContent.replace("{{amount}}", item.totalAmount);
            tableContent = tableContent + htmlTableContent;
            htmlTableContent = DummyTableContent;
        })

        htmlPrintData = htmlPrintData.replace("{{TableContent}}", tableContent);

        printJS({
            printable: htmlPrintData,
            type: "raw-html",
            targetStyles: ["*"],
            honorColor: true,
            scanStyles: true,
        });
    }


    const handleSelect = (eventKey) => {
        setState(() => ({
            ...state,
            delivery: options[eventKey],
        }));

    }

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Date Wise Sales Report</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href="#">Home</a></li>
                                <li className="breadcrumb-item active">Report</li>
                                <li className="breadcrumb-item active">Date Wise Report</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>


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

                            <div className="col-md-6" >
                                <div className="form-group">
                                    <label>Delivery Type</label>
                                    <br />
                                    <DropdownButton
                                        title={state.delivery}
                                        onSelect={handleSelect}
                                    >
                                        {options.map((opt, i) => (
                                            <Dropdown.Item key={i} eventKey={i}>
                                                {opt}
                                            </Dropdown.Item>
                                        ))}
                                    </DropdownButton>

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
                    <div className="card-body">
                        <div id="jsGrid1" ref={myGrid}></div>
                    </div>
                </div>
            </section>
        </div>


    );

}

export default ReportByDatewiseContent;