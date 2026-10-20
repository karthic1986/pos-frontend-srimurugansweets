import { printerOptions, receiptJob, receiptTextJob } from "./ThermalPrintReport";

// Prints the order receipt on a Bluetooth (BLE) receipt printer straight from
// Chrome with Web Bluetooth: no print server, print dialog or printer app. Works
// in Chrome on Android over HTTPS. Bluetooth carries only a few KB a second, so
// the bill goes as ESC/POS text with just the Tamil rows as images
// (receiptTextJob), laid out for BLUETOOTH_PRINTER_PAPER_WIDTH_MM;
// BLUETOOTH_PRINTER_TEXT_MODE "false" sends the print server's full image instead.
// Printers with only classic Bluetooth (no BLE) can't be reached from a browser.
//
// The cashier picks the printer once with "Connect printer" or on Submit
// (Chrome only shows its device chooser after a tap); it stays connected while
// the app is open, and Chrome reconnects it on later prints. After a reload the
// printer is found again without the chooser where Chrome remembers Bluetooth
// permissions (on Android, chrome://flags #enable-web-bluetooth-new-permissions-backend
// and #enable-experimental-web-platform-features). Choosing Bluetooth is
// remembered per device, so the shop PC keeps its own printer.

// Services BLE receipt printers commonly take print data on. Chrome lets the
// page open only the services listed when the printer is picked.
const PRINTER_SERVICES = [
    "000018f0-0000-1000-8000-00805f9b34fb",
    "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
    "49535343-fe7d-4ae5-8fa9-9fafd205e455",
    "0000ff00-0000-1000-8000-00805f9b34fb",
    "0000fff0-0000-1000-8000-00805f9b34fb",
    "0000ffe0-0000-1000-8000-00805f9b34fb",
    "0000ae30-0000-1000-8000-00805f9b34fb",
];
const DEFAULT_PAPER_MM = "58";
// Bytes per write. Writes wait for the printer's reply, so it can't fall behind:
// writes that don't wait corrupt the bill on printers like the RP3230, which
// drop what they can't take in time. Writes with response can be longer than a
// Bluetooth packet (Android splits them). Printers that take only writes
// without response get 20 bytes, the packet size every BLE link carries, and a
// pause after each.
const DEFAULT_CHUNK_WITH_RESPONSE = 100;
const DEFAULT_CHUNK_WITHOUT_RESPONSE = 20;
const WITHOUT_RESPONSE_PAUSE_MS = 10;
const CONNECT_TIMEOUT_MS = 15000;
// Printers drop idle connections (and Android drops them with the screen off),
// and connecting again takes several seconds, so the page reconnects in the
// background as soon as that happens: first after this long, then less often.
const RECONNECT_FIRST_MS = 1000;
const RECONNECT_MAX_MS = 30000;

const PREFERRED_KEY = "bluetoothPrinting";
const DEVICE_KEY = "bluetoothPrinterId";

let device = null;
let characteristic = null;
// The service the printer took data on, tried first when reconnecting.
let printService = null;
// The connect in progress, which prints and background reconnects share.
let connecting = null;
let reconnectTimer = null;
const watchedDevices = new WeakSet();

const storage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch (error) {
            console.log(error);
        }
    },
};

export const isBluetoothSupported = () => typeof navigator !== "undefined" && !!navigator.bluetooth;

// Whether this device prints bills on the Bluetooth printer.
export const isBluetoothPreferred = () => isBluetoothSupported() && storage.get(PREFERRED_KEY) === "true";

export const setBluetoothPreferred = (preferred) => storage.set(PREFERRED_KEY, preferred ? "true" : null);

const printerName = (d) => d.name || "Bluetooth printer";

// Name of the picked printer, or "" if none is picked yet.
export const bluetoothPrinterName = () => (device ? printerName(device) : "");

const withTimeout = (promise, message) => {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), CONNECT_TIMEOUT_MS);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const findWritableCharacteristic = async (server) => {
    const services = printService ? [printService, ...PRINTER_SERVICES.filter((uuid) => uuid !== printService)] : PRINTER_SERVICES;
    for (const uuid of services) {
        let service;
        try {
            service = await server.getPrimaryService(uuid);
        } catch (error) {
            continue; // The printer doesn't have this service.
        }
        const writable = (await service.getCharacteristics()).find(
            (c) => c.properties.write || c.properties.writeWithoutResponse
        );
        if (writable) {
            printService = uuid;
            return writable;
        }
    }
    throw new Error(`${printerName(device)} has no Bluetooth print service this app knows`);
};

// A printer found again after a reload can need Chrome to have seen it advertise
// before it connects; waits for that, at most the connect timeout.
const advertised = (d) =>
    new Promise((resolve) => {
        const abort = new AbortController();
        const done = () => {
            clearTimeout(timer);
            abort.abort();
            resolve();
        };
        const timer = setTimeout(done, CONNECT_TIMEOUT_MS);
        d.addEventListener("advertisementreceived", done, { once: true });
        d.watchAdvertisements({ signal: abort.signal }).catch(done);
    });

const scheduleReconnect = (delay) => {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
        if (!device || !isBluetoothPreferred() || connecting || (device.gatt.connected && characteristic)) return;
        open(device).catch(() => scheduleReconnect(Math.min(delay * 2, RECONNECT_MAX_MS)));
    }, delay);
};

const watchDisconnects = (d) => {
    if (watchedDevices.has(d)) return;
    watchedDevices.add(d);
    d.addEventListener("gattserverdisconnected", () => {
        if (d !== device) return; // A printer replaced by another one.
        characteristic = null;
        scheduleReconnect(RECONNECT_FIRST_MS);
    });
};

const open = (picked) => {
    if (connecting && device === picked) return connecting;
    device = picked;
    characteristic = null;
    watchDisconnects(picked);
    const connect = () =>
        withTimeout(picked.gatt.connect(), `${printerName(picked)} did not connect. Check it is on and near the phone`);
    const attempt = (async () => {
        let server;
        try {
            server = await connect();
        } catch (error) {
            if (!picked.watchAdvertisements) throw error;
            await advertised(picked);
            server = await connect();
        }
        const found = await findWritableCharacteristic(server);
        if (device === picked) characteristic = found;
        storage.set(DEVICE_KEY, picked.id);
    })().finally(() => {
        // A connect to a printer picked since then is left alone.
        if (connecting === attempt) connecting = null;
    });
    connecting = attempt;
    return attempt;
};

// Connects in the background if the printer isn't connected, so the next bill
// doesn't wait for it. The order screen calls it, and so does the phone waking up.
export const warmUpBluetoothPrinter = () => {
    if (!device || !isBluetoothPreferred() || connecting || (device.gatt.connected && characteristic)) return;
    open(device).catch(() => scheduleReconnect(RECONNECT_FIRST_MS * 5));
};

if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") warmUpBluetoothPrinter();
    });
}

// Opens Chrome's device chooser; call it only from a tap. Resolves with the
// printer's name. Rejects with a NotFoundError if the cashier closes the chooser.
export const connectBluetoothPrinter = async () => {
    const picked = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICES,
    });
    if (device && device !== picked && device.gatt.connected) device.gatt.disconnect();
    await open(picked);
    return printerName(picked);
};

// Whether a printer was picked on this device before, even if Chrome has forgotten it since.
export const wasBluetoothPrinterPicked = () => !!storage.get(DEVICE_KEY);

// After a reload, finds the printer picked earlier without the chooser, where
// Chrome remembers it. Resolves with its name, or "" if there is none.
export const restoreBluetoothPrinter = async () => {
    if (device) return printerName(device);
    const id = storage.get(DEVICE_KEY);
    if (!id || !isBluetoothSupported() || !navigator.bluetooth.getDevices) return "";
    const remembered = (await navigator.bluetooth.getDevices()).find((d) => d.id === id);
    if (!remembered) return "";
    // Connected on the first print, so an absent printer doesn't hold up the order screen.
    device = remembered;
    return printerName(remembered);
};

const ensureConnected = async () => {
    // Reprints can come before the order screen has looked for the printer.
    if (!device) await restoreBluetoothPrinter();
    if (!device) throw new Error("No Bluetooth printer connected. Tap Connect printer on the order screen");
    // A background connect already under way is joined, not started again.
    if (connecting) await connecting;
    if (!device.gatt.connected || !characteristic) await open(device);
};

const chunkSize = (settings, withResponse) => {
    const n = Number(settings.BLUETOOTH_PRINTER_CHUNK_BYTES);
    if (Number.isInteger(n) && n >= 20 && n <= 512) return n;
    return withResponse ? DEFAULT_CHUNK_WITH_RESPONSE : DEFAULT_CHUNK_WITHOUT_RESPONSE;
};

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const send = async (bytes, settings) => {
    const withResponse = characteristic.properties.write;
    const size = chunkSize(settings, withResponse);
    for (let i = 0; i < bytes.length; i += size) {
        const chunk = bytes.subarray(i, i + size);
        if (withResponse) {
            await characteristic.writeValueWithResponse(chunk);
        } else {
            await characteristic.writeValueWithoutResponse(chunk);
            await pause(WITHOUT_RESPONSE_PAUSE_MS);
        }
    }
};

const printJob = async (orderDetails, orderId, productList, settings) => {
    const paperMm = (settings.BLUETOOTH_PRINTER_PAPER_WIDTH_MM || "").trim();
    const options = {
        ...printerOptions({ ...settings, PRINTER_PAPER_WIDTH_MM: paperMm === "80" ? "80" : DEFAULT_PAPER_MM }),
        skipBlankRows: true,
    };
    const textMode = (settings.BLUETOOTH_PRINTER_TEXT_MODE || "").trim().toLowerCase() !== "false";
    const job = (textMode ? receiptTextJob : receiptJob)(orderDetails, orderId, productList, settings, options);
    const bytes = new Uint8Array(await job.arrayBuffer());

    await ensureConnected();
    try {
        await send(bytes, settings);
    } catch (error) {
        console.log(error);
        throw new Error(
            device.gatt.connected
                ? `${printerName(device)} stopped taking data (${error.message})`
                : `${printerName(device)} disconnected while printing`
        );
    }
};

// A printer handles one job at a time, so bills print in order.
let queue = Promise.resolve();

// Errors carry a message the cashier can act on; CustomPrintReport shows it.
const BluetoothPrint = (orderDetails, orderId, productList, settings) => {
    const job = queue.then(() => printJob(orderDetails, orderId, productList, settings));
    queue = job.catch(() => {});
    return job;
};

export default BluetoothPrint;
