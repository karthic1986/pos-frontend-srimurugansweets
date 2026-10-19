import printJS from "print-js";
import QRCode from "qrcode";
import moment from "moment";
import constants from "../constants";
import { printerOptions } from "./ThermalPrintReport";

// Prints the order receipt on the thermal printer through the printer's own
// driver, with the browser's print: no print server needed. The bill is laid
// out for the roll width (80mm paper prints 72mm, 58mm prints 48mm). Make the
// thermal printer this PC's default printer, and start Chrome with
// --kiosk-printing to skip the print dialog. Paper width, text size and copies
// come from the PRINTER_* App Settings; darkness and paper cut are driver settings.

// The printer has 8 dots per mm (203 dpi), the unit of the PRINTER_* sizes.
const DOTS_PER_MM = 8;
// Windows has no Tamil glyphs in Arial, so Tamil text falls back to Nirmala UI / Latha.
const FONT_FAMILY = 'Arial, "Nirmala UI", Latha, "Noto Sans Tamil", "Tamil Sangam MN", sans-serif';

const mm = (dots) => `${dots / DOTS_PER_MM}mm`;
const amount = (value) => `₹${Number(value) || 0}`;

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

const pair = (label, value, className = "") =>
    `<tr class="${className}"><td>${escapeHtml(label)}</td><td class="right">${escapeHtml(value)}</td></tr>`;

const itemRow = (item, rate, qty, total, className = "") =>
    `<tr class="${className}"><td>${escapeHtml(item)}</td><td class="right">${escapeHtml(rate)}</td>` +
    `<td class="right">${escapeHtml(qty)}</td><td class="right">${escapeHtml(total)}</td></tr>`;

// Header, items and total are separate tables with the same column widths, so
// the dashed dividers between them line up like the rest of the bill.
const itemTable = (rows) =>
    `<table class="items"><colgroup><col class="item"><col class="rate"><col class="qty"><col class="total"></colgroup>${rows}</table>`;

const receiptHtml = (orderDetails, orderId, productList, footerMessage, qrSvg, { fontSize }) => {
    // COMPANY_DETAILS is HTML for the A5 receipt; reuse its lines and relative sizes.
    const company = new DOMParser().parseFromString(constants.COMPANY_DETAILS, "text/html");
    const companyLines = Array.from(company.querySelectorAll("p"), (p) => {
        const scale = (parseInt(p.style.fontSize, 10) || 100) / 100;
        const size = Math.max(Math.round(fontSize * 0.75), Math.round(fontSize * scale));
        return `<div class="center bold" style="font-size: ${mm(size)}">${escapeHtml(p.textContent.trim())}</div>`;
    }).join("");

    const items = productList
        .filter((prod) => prod.qty > 0)
        .map((prod) => itemRow(prod.printName || prod.name, prod.price, prod.qty, amount(prod.qty * prod.price)))
        .join("");
    const discount = Number(orderDetails.discount) || 0;
    const notes = (orderDetails.notes || "").trim();

    return `<div class="receipt">
        ${companyLines}
        <hr>
        ${orderDetails.customerName ? `<div class="bold">${escapeHtml(orderDetails.customerName)}</div>` : ""}
        ${orderDetails.customerNumber ? `<div>${escapeHtml(orderDetails.customerNumber)}</div>` : ""}
        <table>
            ${pair("Order No", orderId, "bold")}
            ${pair("Order Date", moment(orderDetails.orderDate).format("DD-MM-YYYY"))}
            ${pair("Delivery Date", moment(orderDetails.deliveryDate).format("DD-MM-YYYY"))}
        </table>
        <hr>
        ${itemTable(itemRow("Item", "Rate", "Qty", "Total", "bold"))}
        <hr>
        ${itemTable(items)}
        <hr>
        ${itemTable(itemRow("Total", "", orderDetails.totalQty, amount(orderDetails.totalAmount), "bold"))}
        <hr>
        <table>
            ${pair("Total", amount(orderDetails.totalAmount))}
            ${pair("Amount Paid", amount(orderDetails.payment))}
            ${constants.IS_SHOW_DISCOUNT ? pair("Discount", amount(discount)) : ""}
            ${pair("Balance Amt", amount(orderDetails.totalAmount - orderDetails.payment - discount), "bold balance")}
        </table>
        ${notes ? `<hr><div>Notes: ${escapeHtml(notes)}</div>` : ""}
        <hr>
        <div class="qr">${qrSvg}</div>
        ${footerMessage ? `<div class="center bold">${escapeHtml(footerMessage)}</div>` : ""}
    </div>`;
};

// Column widths match the print server's receipt; the item name takes what's left.
const pageStyle = ({ paperWidth, fontSize }) => `
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .receipt {
        box-sizing: border-box;
        width: ${mm(paperWidth)};
        max-width: 100%;
        margin: 0 auto;
        padding: 1mm 1mm 4mm;
        color: #000;
        font: ${mm(fontSize)}/1.35 ${FONT_FAMILY};
    }
    .receipt + .receipt { break-before: page; }
    .receipt table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .receipt td { padding: 0; vertical-align: top; overflow-wrap: anywhere; }
    .receipt tr { break-inside: avoid; }
    .receipt hr { border: 0; border-top: 0.3mm dashed #000; margin: 1.2mm 0; }
    .items col.item { width: 49%; }
    .items col.rate { width: 17%; }
    .items col.qty { width: 13%; }
    .items col.total { width: 21%; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .balance { font-size: ${mm(fontSize + 4)}; }
    .qr { width: ${mm(Math.min(200, paperWidth / 2))}; margin: 1mm auto 1.5mm; }
    .qr svg { display: block; width: 100%; height: auto; }
`;

const ThermalDriverPrint = async (orderDetails, orderId, productList, settings) => {
    const options = printerOptions(settings);
    const qrSvg = await QRCode.toString(String(orderId), { type: "svg", margin: 0, errorCorrectionLevel: "M" });
    const receipt = receiptHtml(orderDetails, orderId, productList, settings.BILL_FOOTER_MESSAGE, qrSvg, options);
    printJS({
        // Each copy is a full receipt on its own page.
        printable: Array.from({ length: options.copies }, () => receipt).join(""),
        type: "raw-html",
        documentTitle: `Order ${orderId}`,
        style: pageStyle(options),
    });
};

export default ThermalDriverPrint;
