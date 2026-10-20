
import printJS from "print-js";
import QRCode from "qrcode";
import OrderPrintHeader from "../textFiles/OrderPrintHeader.txt";
import OrderPrintTable from "../textFiles/OrderPrintTable.txt";
import constants from "../constants";
import moment from "moment";
import ThermalPrintReport from "./ThermalPrintReport";
import ThermalDriverPrint from "./ThermalDriverPrint";
import BluetoothPrint, { isBluetoothPreferred } from "./BluetoothPrint";
import CustomToast from "./CustomToast";
import { getAppSettingsMap, isPrintServerMethod, isThermalPrintEnabled } from "../actions/appSettingAction";


// Where bills print when nothing is chosen: the Bluetooth printer if this
// device chose it, else the THERMAL_PRINT_ENABLED setting.
export const defaultPrintOn = (settings) => {
    if (isBluetoothPreferred()) return "bluetooth";
    return isThermalPrintEnabled(settings) ? "thermal" : "pc";
};

// printOn: the order screen's "Print on" choice, "thermal", "pc" or "bluetooth".
// Reprints leave it out and use defaultPrintOn. Thermal bills go through the
// printer's driver, or the print server when THERMAL_PRINT_METHOD is "print-server".
const CustomPrintReport = async (orderDetails, orderId,productList, printOn) => {

    // Copy before any await: CartContent resets the quantities a second after calling this.
    productList = productList.map((prod) => ({ ...prod }));

    // If settings can't be loaded, print with the defaults.
    let settings = {};
    try {
        settings = await getAppSettingsMap();
    } catch (error) {
        console.log(error);
    }
    const footerMessage = settings.BILL_FOOTER_MESSAGE || "";

    if (printOn === undefined) printOn = defaultPrintOn(settings);
    if (printOn === "bluetooth") {
        try {
            await BluetoothPrint(orderDetails, orderId, productList, settings);
            return;
        } catch (error) {
            console.log(error);
            CustomToast("error", `Bluetooth print failed: ${error.message}. Opening normal print..`);
        }
    } else if (printOn === "thermal") {
        try {
            const printThermal = isPrintServerMethod(settings) ? ThermalPrintReport : ThermalDriverPrint;
            await printThermal(orderDetails, orderId, productList, settings);
            return;
        } catch (error) {
            console.log(error);
            CustomToast("error", `Thermal print failed: ${error.message}. Opening normal print..`);
        }
    }

    let htmlPrintData = "";
    const response = await fetch(OrderPrintHeader);
    let htmlTemplate = await response.text();

    htmlTemplate = htmlTemplate.replace(
        "{{CompanyDetails}}",
        constants.COMPANY_DETAILS
    );

    htmlTemplate = htmlTemplate.replace(
        "{{CustomerName}}",
        orderDetails.customerName
    );
    htmlTemplate = htmlTemplate.replace(
        "{{CustomerMobile}}",
        orderDetails.customerNumber
    );
    htmlTemplate = htmlTemplate.replace(
        "{{OrderID}}", orderId
    );

    const orderQRCode = await QRCode.toDataURL(orderId.toString(), { margin: 1, width: 150 });
    htmlTemplate = htmlTemplate.replace(
        "{{OrderQRCode}}", orderQRCode
    );
    htmlTemplate = htmlTemplate.replace(
        "{{OrderDate}}", moment(orderDetails.orderDate).format("DD-MM-YYYY")
    );
    htmlTemplate = htmlTemplate.replace(
        "{{DeliveryDate}}", moment(orderDetails.deliveryDate).format("DD-MM-YYYY")
    );
    htmlTemplate = htmlTemplate.replace(
        "{{ToPay}}",
        orderDetails.totalAmount
    );
    htmlTemplate = htmlTemplate.replace(
        "{{TotalQuantity}}",
        orderDetails.totalQty
    );
    htmlTemplate = htmlTemplate.replace(
        "{{TotalTableAmount}}",
        orderDetails.totalAmount
    );

    htmlTemplate = htmlTemplate.replace(
        "{{TotalAmount}}",
        orderDetails.totalAmount
    );

    const hasNotes = orderDetails.notes && orderDetails.notes.trim().length > 0;
    htmlTemplate = htmlTemplate.replace(
        "{{NotesSection}}",
        hasNotes
            ? `<table class="notes"><tr><td><span>${orderDetails.notes}</span></td></tr></table>`
            : ""
    );

    htmlTemplate = htmlTemplate.replace(
        "{{Quotes}}",
        footerMessage
    );

    htmlTemplate = htmlTemplate.replace(
        "{{Discount}}",
        constants.IS_SHOW_DISCOUNT ?
            (
                <tr>
                    <th><span class="contenteditable">Discount</span></th>
                    <td><span data-prefix>₹</span><span>orderDetails.discount</span></td>
                </tr>
            )
            : ""
    );

    htmlTemplate = htmlTemplate.replace("{{Payment}}", orderDetails.payment);
    htmlTemplate = htmlTemplate.replace("{{BalanceAmount}}", (orderDetails.totalAmount - orderDetails.payment - orderDetails.discount));

    htmlPrintData = htmlTemplate;

    let tableContent = "";
    const fecthResponse = await fetch(OrderPrintTable);
    let htmlTableContent = await fecthResponse.text();
    let DummyTableContent = htmlTableContent;

    productList.map((prod) => {
        if (prod.qty > 0) {
            let total = prod.qty*prod.price;
            htmlTableContent = htmlTableContent.replace("{{ProductItem}}", prod.printName || prod.name);
            htmlTableContent = htmlTableContent.replace("{{ProductPrice}}",prod.price);
            htmlTableContent = htmlTableContent.replace("{{ProductQty}}", prod.qty);
            htmlTableContent = htmlTableContent.replace("{{ProductAmount}}",total);
            tableContent = tableContent + htmlTableContent;
            htmlTableContent = DummyTableContent;
        }
    });
    console.log(htmlTableContent);

    htmlPrintData = htmlPrintData.replace("{{tableBody}}", tableContent);

    printJS({
        printable: htmlPrintData,
        type: "raw-html",
        targetStyles: ["*"],
        honorColor: true,
        scanStyles: true,
        style: '@page { size: A5; }'
    });

    
   
};

export default CustomPrintReport;
