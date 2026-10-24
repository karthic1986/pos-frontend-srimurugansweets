import React, { useState, useRef, useEffect } from "react";
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
import CustomPrintReport, { defaultPrintOn } from "../../CustomPrintReport";
import PrintTargetModal from "../../PrintTargetModal";
import { getAppSettingsMap } from "../../../actions/appSettingAction";
import { bluetoothPrinterName, connectBluetoothPrinter, restoreBluetoothPrinter } from "../../BluetoothPrint";
import { savedFromDate, saveFromDate } from "../../../reportFromDate";
import ReportFilter, { ReportFilterField } from "./ReportFilter";
import { Segmented } from "antd";

// Rows are ordered by Order No, newest (descending) first unless this browser
// saved another order, from the Order No filter or the column header.
const ORDER_NO_SORT_KEY = "datewiseReport.orderNoSort";

const savedOrderNoSort = () => {
    try {
        return localStorage.getItem(ORDER_NO_SORT_KEY) === "asc" ? "asc" : "desc";
    } catch (error) {
        return "desc";
    }
};

const saveOrderNoSort = (sort) => {
    try {
        localStorage.setItem(ORDER_NO_SORT_KEY, sort);
    } catch (error) {
        console.log(error);
    }
};

const sortByOrderNo = (rows, sort) =>
    [...rows].sort((a, b) => (sort === "asc" ? a.orderId - b.orderId : b.orderId - a.orderId));

const ReportByDatewiseContent = () => {

    const myGrid = useRef(null);
    var past = new Date();
    past.setDate(past.getDate() - 30);
    const [report, setReport] = useState([]);
    const [state, setState] = useState({
        fromDate: savedFromDate("datewise", past),
        toDate: new Date(),
        delivery: 'All',
    });

    const [orderNoSort, setOrderNoSort] = useState(savedOrderNoSort);
    // For the grid's callbacks, which outlive the render that made them.
    const orderNoSortRef = useRef(orderNoSort);

    let tableContent=[];
    const options = ["All", "Delivered", "Undelivered"];

    const changeOrderNoSort = (sort, rows) => {
        orderNoSortRef.current = sort;
        saveOrderNoSort(sort);
        setOrderNoSort(sort);
        setReport(sortByOrderNo(rows, sort));
    };

    useEffect(
        () => {
            getReport();
        }, []);


    const handleChangeFromDate = (e) => {
        saveFromDate("datewise", e);
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

    // The order whose bill is being reprinted, while the cashier picks the printer.
    const [printing, setPrinting] = useState(null);
    const [defaultPrintTarget, setDefaultPrintTarget] = useState("thermal");
    const [bluetoothPrinter, setBluetoothPrinter] = useState(bluetoothPrinterName);

    // Resolves with what CustomPrintReport needs for the order's bill.
    const loadOrderForPrint = (orderId) =>
        getOrderDetailsSvc(orderId).then((res) => {
            if (res.status != 200) throw new Error(`Order details: status ${res.status}`);
            dispatch({
                payload: res.data,
                type: GET_ORDER_DETAILS,
            });
            return {
                orderDetails: {
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
                    discount: res.data.order.Discount === "" ? 0 : res.data.order.Discount,
                },
                productList: res.data.orderDetails,
            };
        });

    // The grid's print icon: asks where to print, loading the order meanwhile.
    const handlePrintClick = (item) => {
        const order = loadOrderForPrint(item.orderId);
        order.catch(() => {}); // Reported when the cashier picks a printer.
        setPrinting({ orderId: item.orderId, order });
        getAppSettingsMap()
            .then((settings) => setDefaultPrintTarget(defaultPrintOn(settings)))
            .catch((error) => console.log(error));
        restoreBluetoothPrinter()
            .then(setBluetoothPrinter)
            .catch((error) => console.log(error));
    };

    // Runs straight from the tap, so Chrome can show its printer list if the
    // order screen hasn't picked a Bluetooth printer on this device yet.
    const handleChoosePrintTarget = async (target) => {
        const { orderId, order } = printing;
        setPrinting(null);
        if (target === "bluetooth" && !bluetoothPrinterName()) {
            try {
                setBluetoothPrinter(await connectBluetoothPrinter());
            } catch (error) {
                // NotFoundError: the cashier closed Chrome's printer list.
                if (error.name !== "NotFoundError") CustomToast("error", error.message);
                return;
            }
        }
        try {
            const { orderDetails, productList } = await order;
            CustomPrintReport(orderDetails, orderId, productList, target);
        } catch (error) {
            console.log(error);
            CustomToast("error", "Failed to Load Order details. Please try again..");
        }
    };

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

            showReport(tableContent, orderNoSortRef.current);
        }
        else {
            CustomToast("error", "Try again");
            console.log(res.status);
        }
    };

    const showReport = (rows, sort) => {
        tableContent = sortByOrderNo(rows, sort);
        setReport(tableContent);

        const grid = window.jQuery(myGrid.current);
        grid.jsGrid({
            height: "auto",
            width: "100%",
            sorting: true,
            paging: true,
            data: tableContent,
            // Sorting Order No from its column header is saved like the filter.
            onRefreshed: function (args) {
                const sorting = args.grid.getSorting();
                if (sorting.field === "orderId" && sorting.order !== orderNoSortRef.current) {
                    changeOrderNoSort(sorting.order, args.grid.option("data"));
                }
            },
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
        // Shows the order on the Order No header.
        grid.jsGrid("sort", { field: "orderId", order: sort });
    };

    const handleChangeOrderNoSort = (sort) => {
        changeOrderNoSort(sort, report);
        showReport(report, sort);
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
                <ReportFilter
                    fromDate={state.fromDate}
                    toDate={state.toDate}
                    onFromDateChange={handleChangeFromDate}
                    onToDateChange={handleChangeToDate}
                    onGetReport={getReport}
                    onPrint={printReport}
                >
                    <ReportFilterField label="Delivery">
                        <Segmented
                            size="large"
                            options={options}
                            value={state.delivery}
                            onChange={(delivery) => setState((s) => ({ ...s, delivery }))}
                        />
                    </ReportFilterField>
                    <ReportFilterField label="Order No">
                        <Segmented
                            size="large"
                            options={[
                                { label: "Descending", value: "desc" },
                                { label: "Ascending", value: "asc" },
                            ]}
                            value={orderNoSort}
                            onChange={handleChangeOrderNoSort}
                        />
                    </ReportFilterField>
                </ReportFilter>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Report</h3>
                    </div>
                    <div className="card-body">
                        <div id="jsGrid1" ref={myGrid}></div>
                    </div>
                </div>
            </section>

            <PrintTargetModal
                open={!!printing}
                orderId={printing?.orderId}
                defaultTarget={defaultPrintTarget}
                bluetoothPrinter={bluetoothPrinter}
                onChoose={handleChoosePrintTarget}
                onCancel={() => setPrinting(null)}
            />
        </div>


    );

}

export default ReportByDatewiseContent;