import QRCode from "qrcode";
import moment from "moment";
import constants from "../constants";

// Prints the order receipt on the RP3230 thermal printer through the local
// print server (print-server/server.js), when THERMAL_PRINT_METHOD is
// "print-server" (ThermalDriverPrint is the default). The receipt is drawn on a canvas and
// sent as an ESC/POS raster image, because the printer's built-in fonts have
// no Tamil glyphs. Printer address, paper, text size, darkness and copies
// come from the PRINTER_* App Settings. BluetoothPrint sends the much smaller
// receiptTextJob instead, as Bluetooth carries a tenth of the data or less.

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
// The printer's Font A is 12 x 24 dots: 48 characters on 80mm paper, 32 on 58mm.
const CHAR_DOTS = 12;
// Characters left blank at the right of text-mode lines, so amounts don't print at the paper's edge.
const RIGHT_MARGIN_CHARS = 2;
// Rows taller than this share of the text size print double height in text mode.
const TALL_ROW = 1.15;
// ESC * bit images print inline with text, 24 dots high: one line of Font A.
const INLINE_IMAGE_DOTS = 24;
// What the printer's own font can print; any other character (Tamil) makes the row an image.
const PRINTABLE = /^[\x20-\x7e\n]*$/;

const ESC = 0x1b;
const GS = 0x1d;

const font = (size, bold) => `${bold ? "bold " : ""}${size}px ${FONT_FAMILY}`;
const amount = (value) => `₹${Number(value) || 0}`;

const intSetting = (value, fallback, min, max) => {
    const n = Number(value);
    return value !== "" && Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

// App Settings (all strings) -> print options. Blank or invalid values use the
// defaults, except PRINTER_HOST, which has none. ThermalDriverPrint and BluetoothPrint use them too.
export const printerOptions = (settings) => ({
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

// A blank canvas the paper's width, with createLayout measuring on it.
const canvasLayout = (paperWidth, fontSize) => {
    const canvas = document.createElement("canvas");
    canvas.width = paperWidth;
    const ctx = canvas.getContext("2d");
    return { canvas, ctx, layout: createLayout(ctx, paperWidth, fontSize) };
};

const paint = ({ canvas, ctx, layout }) => {
    canvas.height = layout.height;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    layout.draw(ctx);
    return canvas;
};

// The bill's content, for either layout: createLayout draws it, createTextLayout
// turns it into ESC/POS text and small images.
const layoutReceipt = (layout, orderDetails, orderId, productList, footerMessage, fontSize) => {
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
            itemRow(prod.printName || prod.name, String(prod.price), String(prod.qty), String(prod.qty * prod.price))
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
};

const renderReceipt = (orderDetails, orderId, productList, footerMessage, { paperWidth, fontSize }) => {
    const drawing = canvasLayout(paperWidth, fontSize);
    layoutReceipt(drawing.layout, orderDetails, orderId, productList, footerMessage, fontSize);
    return paint(drawing);
};

// One bit per dot, MSB = leftmost; width is a multiple of 8 so rows pack exactly.
const rasterOf = (canvas, darkness) => {
    const { width, height } = canvas;
    const pixels = canvas.getContext("2d").getImageData(0, 0, width, height).data;
    const bytesPerRow = width / 8;
    const raster = new Uint8Array(bytesPerRow * height);
    for (let i = 0; i < width * height; i++) {
        const luminance = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2];
        if (luminance < darkness) raster[i >> 3] |= 0x80 >> (i & 7);
    }
    return { raster, bytesPerRow, height };
};

// GS v 0 bands of a raster. skipBlankRows feeds the paper past white rows
// (ESC J) instead of sending them; trimRight leaves out the white bytes right of
// each band's ink. Both only shorten the job: the paper comes out the same.
const rasterCommands = ({ raster, bytesPerRow, height }, { skipBlankRows = false, trimRight = false } = {}) => {
    const isBlank = (row) => {
        if (!skipBlankRows) return false;
        for (let i = row * bytesPerRow; i < (row + 1) * bytesPerRow; i++) if (raster[i]) return false;
        return true;
    };

    const commands = [];
    for (let top = 0; top < height; ) {
        let end = top + 1;
        if (isBlank(top)) {
            while (end < height && isBlank(end)) end++;
            // ESC J n: feed n dots, at most 255 per command
            for (let left = end - top; left > 0; left -= 255) commands.push(Uint8Array.of(ESC, 0x4a, Math.min(255, left)));
        } else {
            while (end < height && end - top < BAND_HEIGHT && !isBlank(end)) end++;
            const rows = end - top;
            let band = raster.subarray(top * bytesPerRow, end * bytesPerRow);
            let width = bytesPerRow;
            if (trimRight) {
                width = 1;
                for (let r = 0; r < rows; r++) {
                    for (let b = bytesPerRow - 1; b >= width; b--) {
                        if (band[r * bytesPerRow + b]) {
                            width = b + 1;
                            break;
                        }
                    }
                }
                const trimmed = new Uint8Array(width * rows);
                for (let r = 0; r < rows; r++) trimmed.set(band.subarray(r * bytesPerRow, r * bytesPerRow + width), r * width);
                band = trimmed;
            }
            // GS v 0: raster image of width bytes x rows
            commands.push(Uint8Array.of(GS, 0x76, 0x30, 0, width & 0xff, width >> 8, rows & 0xff, rows >> 8));
            commands.push(band);
        }
        top = end;
    }
    return commands;
};

// Reset, the bill, then feed and cut; each copy is a full receipt with its own cut.
const finishJob = (commands, copies) => {
    const receipt = [
        Uint8Array.of(ESC, 0x40), // ESC @: reset printer
        ...commands,
        Uint8Array.of(ESC, 0x64, 3), // ESC d 3: feed 3 lines
        Uint8Array.of(GS, 0x56, 0x42, 0), // GS V B 0: feed to cutter and cut
    ];
    const parts = Array.from({ length: copies }, () => receipt).flat();
    return new Blob(parts, { type: "application/octet-stream" });
};

// skipBlankRows: see rasterCommands. BluetoothPrint uses it when text mode is off.
const toEscPos = (canvas, { darkness, copies, skipBlankRows = false }) =>
    finishJob(rasterCommands(rasterOf(canvas, darkness), { skipBlankRows }), copies);

const ascii = (text) => Uint8Array.from(text, (ch) => ch.charCodeAt(0));

// Word-wraps text to lines of at most width characters.
const wrapChars = (text, width) => {
    const lines = [];
    String(text).split("\n").forEach((paragraph) => {
        let line = "";
        paragraph.split(/\s+/).filter(Boolean).forEach((word) => {
            const candidate = line ? `${line} ${word}` : word;
            if (candidate.length <= width) {
                line = candidate;
                return;
            }
            if (line) lines.push(line);
            line = word;
            while (line.length > width) {
                lines.push(line.slice(0, width));
                line = line.slice(width);
            }
        });
        if (line) lines.push(line);
    });
    return lines.length ? lines : [""];
};

const padTo = (text, width, align) => {
    const gap = width - text.length;
    if (align === "right") return " ".repeat(gap) + text;
    if (align === "center") return " ".repeat(Math.floor(gap / 2)) + text + " ".repeat(Math.ceil(gap / 2));
    return text + " ".repeat(gap);
};

// Same interface as createLayout, but builds ESC/POS commands: rows the
// printer's font can print become text (a few bytes a line), other rows (Tamil)
// small images cut down to their ink, and the QR code the printer's own symbol.
// Amounts print as "Rs." as the font has no rupee sign.
const createTextLayout = ({ paperWidth, fontSize, darkness }) => {
    const contentWidth = paperWidth - PADDING * 2;
    const chars = Math.floor(paperWidth / CHAR_DOTS) - RIGHT_MARGIN_CHARS;
    const commands = [];

    const imageRow = (cols) => {
        const drawing = canvasLayout(paperWidth, fontSize);
        drawing.layout.row(cols);
        commands.push(...rasterCommands(rasterOf(paint(drawing), darkness), { skipBlankRows: true, trimRight: true }));
    };

    const measure = document.createElement("canvas").getContext("2d");

    // text drawn across a column, thresholded, with the bounds of its ink (bottom < 0: none).
    const inked = (text, width, align, size, bold) => {
        const canvas = document.createElement("canvas");
        // rasterOf packs whole bytes per row, so the canvas is a multiple of 8 dots wide.
        canvas.width = Math.ceil(width / 8) * 8;
        canvas.height = Math.round(size * 2);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.font = font(size, bold);
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(text, align === "right" ? width : align === "center" ? width / 2 : 0, canvas.height / 2);

        const bits = rasterOf(canvas, darkness);
        const ink = { bits, top: bits.height, bottom: -1, left: width, right: -1 };
        for (let y = 0; y < bits.height; y++) {
            for (let x = 0; x < width; x++) {
                if (!(bits.raster[y * bits.bytesPerRow + (x >> 3)] & (0x80 >> (x & 7)))) continue;
                ink.top = Math.min(ink.top, y);
                ink.bottom = Math.max(ink.bottom, y);
                ink.left = Math.min(ink.left, x);
                ink.right = Math.max(ink.right, x);
            }
        }
        return ink;
    };

    // One line of Tamil (or other) text as an ESC * bit image the height of a
    // text line, so it prints inline with the text around it: { lead, image, trail },
    // with lead and trail the blank characters either side. Text whose ink is
    // taller is drawn smaller until it fits, which keeps it sharp.
    const inlineImage = (text, columnChars, { align = "left", size = fontSize, bold = false }) => {
        const width = columnChars * CHAR_DOTS;
        let ink = inked(text, width, align, size, bold);
        for (let tries = 0; tries < 4 && ink.bottom - ink.top + 1 > INLINE_IMAGE_DOTS; tries++) {
            size = Math.floor((size * INLINE_IMAGE_DOTS) / (ink.bottom - ink.top + 1));
            ink = inked(text, width, align, size, bold);
        }
        if (ink.bottom < 0) return { lead: columnChars, image: null, trail: 0 };

        const { bits, left, right } = ink;
        // Centred in the line, and cut off if a glyph still doesn't fit.
        const top = Math.round((ink.top + ink.bottom + 1 - INLINE_IMAGE_DOTS) / 2);
        const lead = Math.floor(left / CHAR_DOTS);
        // Whole characters wide, so the text after it stays in its column.
        const imageChars = Math.ceil((right + 1) / CHAR_DOTS) - lead;
        const dots = imageChars * CHAR_DOTS;

        // ESC * 33: 24-dot bit image, 3 bytes per dot column, top dot = MSB of the first byte.
        const image = new Uint8Array(5 + dots * 3);
        image.set([ESC, 0x2a, 33, dots & 0xff, dots >> 8]);
        for (let x = 0; x < dots; x++) {
            const sourceX = lead * CHAR_DOTS + x;
            for (let y = 0; y < INLINE_IMAGE_DOTS; y++) {
                const sourceY = top + y;
                if (sourceY < 0 || sourceY >= bits.height) continue;
                if (bits.raster[sourceY * bits.bytesPerRow + (sourceX >> 3)] & (0x80 >> (sourceX & 7))) {
                    image[5 + x * 3 + (y >> 3)] |= 0x80 >> (y & 7);
                }
            }
        }
        return { lead, image, trail: columnChars - lead - imageChars };
    };

    // Text lines in the printer's font; plain[i] false makes column i inline images.
    const lineRow = (cols, texts, plain) => {
        // Character columns in proportion to the dot widths, adding up to a full line.
        let used = 0;
        let edge = 0;
        const widths = cols.map(({ width }) => {
            edge += width;
            const end = Math.round((edge / contentWidth) * chars);
            const columnChars = Math.max(1, end - used);
            used += columnChars;
            return columnChars;
        });
        const wrapped = texts.map((text, i) => {
            if (plain[i]) return wrapChars(text, widths[i]);
            measure.font = font(cols[i].size || fontSize, cols[i].bold);
            return wrapText(measure, text, widths[i] * CHAR_DOTS).map((line) => inlineImage(line, widths[i], cols[i]));
        });
        // Only all-text rows reach here tall: row() sends tall Tamil rows as images.
        const tall = cols.some(({ size = fontSize }) => size >= fontSize * TALL_ROW);

        if (tall) commands.push(Uint8Array.of(GS, 0x21, 0x01)); // GS ! 1: double height
        for (let line = 0; line < Math.max(...wrapped.map((w) => w.length)); line++) {
            // Pieces of the line: strings (spaces and text) and bit images.
            const pieces = [];
            cols.forEach(({ align = "left", bold = false }, i) => {
                const cell = wrapped[i][line];
                if (!plain[i]) {
                    if (!cell) return pieces.push(" ".repeat(widths[i]));
                    pieces.push(" ".repeat(cell.lead));
                    if (cell.image) pieces.push(cell.image);
                    return pieces.push(" ".repeat(cell.trail));
                }
                const text = padTo(cell || "", widths[i], align);
                if (bold && text.trim()) pieces.push(Uint8Array.of(ESC, 0x45, 1), text, Uint8Array.of(ESC, 0x45, 0)); // ESC E: bold
                else pieces.push(text);
            });
            // Trailing spaces only cost time.
            for (let i = pieces.length - 1; i >= 0; i--) {
                if (typeof pieces[i] !== "string") {
                    if (pieces[i][0] === ESC && pieces[i][1] === 0x45) continue;
                    break;
                }
                pieces[i] = pieces[i].trimEnd();
                if (pieces[i]) break;
            }
            pieces.forEach((piece) => {
                if (typeof piece !== "string") commands.push(piece);
                else if (piece) commands.push(ascii(piece));
            });
            commands.push(Uint8Array.of(0x0a));
        }
        if (tall) commands.push(Uint8Array.of(GS, 0x21, 0x00));
    };

    const layout = {
        contentWidth,
        commands,

        // Text where the printer's font can print it. Other text (Tamil) prints
        // as inline images on normal rows, and tall rows (the shop name) as one image.
        row(cols) {
            const texts = cols.map(({ text }) => String(text ?? "").replace(/₹/g, "Rs."));
            const plain = texts.map((text) => PRINTABLE.test(text));
            const tall = cols.some(({ size = fontSize }) => size >= fontSize * TALL_ROW);
            if (tall && !plain.every(Boolean)) imageRow(cols.map((col, i) => ({ ...col, text: texts[i] })));
            else lineRow(cols, texts, plain);
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
            commands.push(ascii(`${"-".repeat(chars)}\n`));
        },

        space(px) {
            commands.push(Uint8Array.of(ESC, 0x4a, Math.min(255, px)));
        },

        qr(text, size) {
            const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
            const moduleDots = Math.max(1, Math.min(16, Math.floor(size / modules.size)));
            const data = ascii(text);
            const storeLength = data.length + 3;
            commands.push(
                Uint8Array.of(ESC, 0x61, 1), // ESC a 1: centre
                Uint8Array.of(GS, 0x28, 0x6b, 4, 0, 49, 65, 50, 0), // QR model 2
                Uint8Array.of(GS, 0x28, 0x6b, 3, 0, 49, 67, moduleDots), // module size in dots
                Uint8Array.of(GS, 0x28, 0x6b, 3, 0, 49, 69, 49), // error correction M
                Uint8Array.of(GS, 0x28, 0x6b, storeLength & 0xff, storeLength >> 8, 49, 80, 48), // store the data
                data,
                Uint8Array.of(GS, 0x28, 0x6b, 3, 0, 49, 81, 48), // print the symbol
                Uint8Array.of(ESC, 0x61, 0) // ESC a 0: left
            );
        },
    };
    return layout;
};

// The receipt as ESC/POS bytes, for options from printerOptions. BluetoothPrint sends it too.
export const receiptJob = (orderDetails, orderId, productList, settings, options) =>
    toEscPos(renderReceipt(orderDetails, orderId, productList, settings.BILL_FOOTER_MESSAGE, options), options);

// The receipt as ESC/POS text, with only the Tamil rows as images: a small
// fraction of receiptJob's bytes, for Bluetooth. English text uses the printer's font.
export const receiptTextJob = (orderDetails, orderId, productList, settings, options) => {
    const layout = createTextLayout(options);
    layoutReceipt(layout, orderDetails, orderId, productList, settings.BILL_FOOTER_MESSAGE, options.fontSize);
    return finishJob(layout.commands, options.copies);
};

// Errors carry a message the cashier can act on; CustomPrintReport shows it.
const ThermalPrintReport = async (orderDetails, orderId, productList, settings) => {
    const options = printerOptions(settings);
    if (!options.host) throw new Error("PRINTER_HOST is not set in Settings > App Settings");
    const job = receiptJob(orderDetails, orderId, productList, settings, options);
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
