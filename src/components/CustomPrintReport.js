
import printJS from "print-js";
import QRCode from "qrcode";
import OrderPrintHeader from "../textFiles/OrderPrintHeader.txt";
import OrderPrintTable from "../textFiles/OrderPrintTable.txt";
import constants from "../constants";
import moment from "moment";


const CustomPrintReport = async (orderDetails, orderId,productList) => {

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
        constants.COMPANY_QUOTES
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
            htmlTableContent = htmlTableContent.replace("{{ProductItem}}", prod.name);
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
