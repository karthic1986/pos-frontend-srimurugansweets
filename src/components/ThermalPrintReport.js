import QRCode from "qrcode";
import moment from "moment";
import constants from "../constants";

// Prints the order receipt on the RP3230 thermal printer through the local
// print server (print-server/server.js). The receipt is drawn on a canvas and
// sent as an ESC/POS raster image, because the printer's built-in fonts have
// no Tamil glyphs. Printer address, paper, text size, darkness and copies
// come from the PRINTER_* App Settings.

// Printable dots per line at 203 dpi, by paper width in mm
// (80mm paper prints 72mm = 576 dots, 58mm prints 48mm = 384 dots).
const PAPER_DOTS = { 80: 576, 58: 384 };
const DEFAULT_PAPER_MM = 80;
// Raw printing port used by almost every network receipt printer.
const DEFAULT_PRINTER_PORT = 9100;
const DEFAULT_FONT_SIZE = 24;
// Pixels darker than this print black; higher prints bolder.
const DEFAULT_DARKNESS = 160;
const PADDING = 6;
// Canvas falls back per glyph, so Tamil text picks up the system Tamil font.
const FONT_FAMILY = '"Helvetica Neue", Arial, "Tamil Sangam MN", "Noto Sans Tamil", sans-serif';
// Rows per GS v 0 command, to stay within small printer buffers.
const BAND_HEIGHT = 128;
const PRINT_TIMEOUT_MS = 10000;

const font = (size, bold) => `${bold ? "bold " : ""}${size}px ${FONT_FAMILY}`;
const amount = (value) => `₹${Number(value) || 0}`;

const intSetting = (value, fallback, min, max) => {
    const n = Number(value);
    return value !== "" && Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

// App Settings (all strings) -> print options. Blank or invalid values use the
// defaults, except PRINTER_HOST, which has none.
const printerOptions = (settings) => ({
    host: (settings.PRINTER_HOST || "").trim(),
    port: intSetting(settings.PRINTER_PORT, DEFAULT_PRINTER_PORT, 1, 65535),
    paperWidth: PAPER_DOTS[intSetting(settings.PRINTER_PAPER_WIDTH_MM, DEFAULT_PAPER_MM, 1, 999)] || PAPER_DOTS[DEFAULT_PAPER_MM],
    fontSize: intSetting(settings.PRINTER_FONT_SIZE, DEFAULT_FONT_SIZE, 16, 40),
    darkness: intSetting(settings.PRINTER_DARKNESS, DEFAULT_DARKNESS, 100, 220),
    copies: intSetting(settings.PRINTER_COPIES, 1, 1, 5),
});

const wrapText = (ctx, text, maxWidth) => {
    const lines = [];
    String(text ?? "").split("\n").forEach((paragraph) => {
        let line = "";
        paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (ctx.measureText(candidate).width <= maxWidth) {
                line = candidate;
                return;
            }
            if (line) lines.push(line);
            line = word;
            // A single word wider than the column is split across lines.
            while (line.length > 1 && ctx.measureText(line).width > maxWidth) {
                let cut = line.length - 1;
                while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--;
                lines.push(line.slice(0, cut));
                line = line.slice(cut);
            }
        });
        if (line) lines.push(line);
    });
    return lines.length ? lines : [""];
};

// Measures the receipt top to bottom, recording draw calls so the canvas can
// be sized to fit before anything is drawn.
const createLayout = (ctx, paperWidth, fontSize) => {
    const contentWidth = paperWidth - PADDING * 2;
    const ops = [];
    let y = 0;

    const layout = {
        contentWidth,
        get height() {
            return y;
        },
        draw: (target) => ops.forEach((op) => op(target)),

        // cols: [{ text, width, align, size, bold }], widths adding up to contentWidth
        row(cols) {
            const top = y;
            let left = PADDING;
            let rowHeight = 0;
            cols.forEach(({ text, width, align = "left", size = fontSize, bold = false }) => {
                ctx.font = font(size, bold);
                const lines = wrapText(ctx, text, width);
                const lineHeight = Math.round(size * 1.4);
                const anchor = align === "right" ? left + width : align === "center" ? left + width / 2 : left;
                ops.push((c) => {
                    c.font = font(size, bold);
                    c.textAlign = align;
                    c.textBaseline = "middle";
                    lines.forEach((line, i) => c.fillText(line, anchor, top + lineHeight * i + lineHeight / 2));
                });
                rowHeight = Math.max(rowHeight, lines.length * lineHeight);
                left += width;
            });
            y += rowHeight;
        },

        text(text, options) {
            layout.row([{ text, width: contentWidth, ...options }]);
        },

        pair(label, value, options) {
            layout.row([
                { text: label, width: contentWidth / 2, ...options },
                { text: value, width: contentWidth / 2, ...options, align: "right" },
            ]);
        },

        divider() {
            const lineY = y + 10;
            ops.push((c) => {
                for (let x = PADDING; x < PADDING + contentWidth; x += 12) c.fillRect(x, lineY, 8, 2);
            });
            y += 22;
        },

        space(px) {
            y += px;
        },

        qr(text, size) {
            const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
            const scale = Math.floor(size / modules.size);
            const left = Math.round((paperWidth - modules.size * scale) / 2);
            const top = y;
            ops.push((c) => {
                for (let r = 0; r < modules.size; r++) {
                    for (let col = 0; col < modules.size; col++) {
                        if (modules.get(r, col)) c.fillRect(left + col * scale, top + r * scale, scale, scale);
                    }
                }
            });
            y += modules.size * scale;
        },
    };
    return layout;
};

const renderReceipt = (orderDetails, orderId, productList, footerMessage, { paperWidth, fontSize }) => {
    const canvas = document.createElement("canvas");
    canvas.width = paperWidth;
    const ctx = canvas.getContext("2d");
    const layout = createLayout(ctx, paperWidth, fontSize);
    const { contentWidth } = layout;

    // COMPANY_DETAILS is HTML for the A5 receipt; reuse its lines and relative sizes.
    const company = new DOMParser().parseFromString(constants.COMPANY_DETAILS, "text/html");
    company.querySelectorAll("p").forEach((p) => {
        const scale = (parseInt(p.style.fontSize, 10) || 100) / 100;
        layout.text(p.textContent.trim(), {
            align: "center",
            bold: true,
            size: Math.max(Math.round(fontSize * 0.75), Math.round(fontSize * scale)),
        });
    });
    layout.divider();

    if (orderDetails.customerName) layout.text(orderDetails.customerName, { bold: true });
    if (orderDetails.customerNumber) layout.text(String(orderDetails.customerNumber));
    layout.pair("Order No", String(orderId), { bold: true });
    layout.pair("Order Date", moment(orderDetails.orderDate).format("DD-MM-YYYY"));
    layout.pair("Delivery Date", moment(orderDetails.deliveryDate).format("DD-MM-YYYY"));
    layout.divider();

    // Column widths scale with the paper; the item name takes what's left.
    const rateWidth = Math.round(contentWidth * 0.17);
    const qtyWidth = Math.round(contentWidth * 0.13);
    const totalWidth = Math.round(contentWidth * 0.21);
    const itemWidth = contentWidth - rateWidth - qtyWidth - totalWidth;
    const itemRow = (item, rate, qty, total, style) =>
        layout.row([
            { text: item, width: itemWidth, ...style },
            { text: rate, width: rateWidth, align: "right", ...style },
            { text: qty, width: qtyWidth, align: "right", ...style },
            { text: total, width: totalWidth, align: "right", ...style },
        ]);

    itemRow("Item", "Rate", "Qty", "Total", { bold: true });
    layout.divider();
    productList
        .filter((prod) => prod.qty > 0)
        .forEach((prod) =>
            itemRow(prod.printName || prod.name, String(prod.price), String(prod.qty), amount(prod.qty * prod.price))
        );
    layout.divider();
    itemRow("Total", "", String(orderDetails.totalQty), amount(orderDetails.totalAmount), { bold: true });
    layout.divider();

    const discount = Number(orderDetails.discount) || 0;
    layout.pair("Total", amount(orderDetails.totalAmount));
    layout.pair("Amount Paid", amount(orderDetails.payment));
    if (constants.IS_SHOW_DISCOUNT) layout.pair("Discount", amount(discount));
    layout.pair("Balance Amt", amount(orderDetails.totalAmount - orderDetails.payment - discount), {
        bold: true,
        size: fontSize + 4,
    });

    if (orderDetails.notes && orderDetails.notes.trim()) {
        layout.divider();
        layout.text(`Notes: ${orderDetails.notes.trim()}`);
    }
    layout.divider();
    layout.space(8);
    layout.qr(String(orderId), Math.min(200, Math.round(contentWidth / 2)));
    layout.space(12);
    if (footerMessage) layout.text(footerMessage, { align: "center", bold: true });

    canvas.height = layout.height;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    layout.draw(ctx);
    return canvas;
};

const toEscPos = (canvas, { darkness, copies }) => {
    const { width, height } = canvas;
    const pixels = canvas.getContext("2d").getImageData(0, 0, width, height).data;
    const bytesPerRow = width / 8;
    // One bit per dot, MSB = leftmost; width is a multiple of 8 so rows pack exactly.
    const raster = new Uint8Array(bytesPerRow * height);
    for (let i = 0; i < width * height; i++) {
        const luminance = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2];
        if (luminance < darkness) raster[i >> 3] |= 0x80 >> (i & 7);
    }

    const receipt = [Uint8Array.of(0x1b, 0x40)]; // ESC @: reset printer
    for (let top = 0; top < height; top += BAND_HEIGHT) {
        const rows = Math.min(BAND_HEIGHT, height - top);
        // GS v 0: raster image of bytesPerRow x rows
        receipt.push(Uint8Array.of(0x1d, 0x76, 0x30, 0, bytesPerRow & 0xff, bytesPerRow >> 8, rows & 0xff, rows >> 8));
        receipt.push(raster.subarray(top * bytesPerRow, (top + rows) * bytesPerRow));
    }
    receipt.push(Uint8Array.of(0x1b, 0x64, 3)); // ESC d 3: feed 3 lines
    receipt.push(Uint8Array.of(0x1d, 0x56, 0x42, 0)); // GS V B 0: feed to cutter and cut

    // Each copy is a full receipt with its own cut.
    const parts = Array.from({ length: copies }, () => receipt).flat();
    return new Blob(parts, { type: "application/octet-stream" });
};

// Errors carry a message the cashier can act on; CustomPrintReport shows it.
const ThermalPrintReport = async (orderDetails, orderId, productList, settings) => {
    const options = printerOptions(settings);
    if (!options.host) throw new Error("PRINTER_HOST is not set in Settings > App Settings");
    const job = toEscPos(renderReceipt(orderDetails, orderId, productList, settings.BILL_FOOTER_MESSAGE, options), options);
    const query = new URLSearchParams({ host: options.host, port: options.port });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PRINT_TIMEOUT_MS);
    let response;
    try {
        response = await fetch(`${constants.THERMAL_PRINT_SERVER_URL}/print?${query}`, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: job,
            signal: controller.signal,
        });
    } catch (error) {
        // fetch rejects only when the print server can't be reached or doesn't answer in time.
        throw new Error(error.name === "AbortError" ? "Print server did not respond" : "Print server is not running");
    } finally {
        clearTimeout(timer);
    }
    if (!response.ok) throw new Error((await response.text()) || `Print server error ${response.status}`);
};

export default ThermalPrintReport;
