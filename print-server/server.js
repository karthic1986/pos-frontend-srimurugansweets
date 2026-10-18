// Local bridge between the POS web app and the RP3230 thermal printer.
// Browsers can't open raw TCP sockets, so the app POSTs ready-made ESC/POS
// bytes to this server and it forwards them to the printer's raw port 9100.
//
//   npm run print-server
//
// GET  /status?host=&port=  checks that the printer is reachable
// POST /print?host=&port=   body = ESC/POS bytes (application/octet-stream)
//
// The printer address isn't configured here: the app sends it with every
// request, from the PRINTER_HOST / PRINTER_PORT App Settings.
const http = require("http");
const net = require("net");

// Must match THERMAL_PRINT_SERVER_URL in src/constants.js.
const PORT = 9101;
const MAX_JOB_BYTES = 5 * 1024 * 1024;
const HOST_PATTERN = /^[A-Za-z0-9.-]{1,253}$/;

// Only the POS itself may print: the local dev server and the App Engine services.
const ALLOWED_ORIGINS = [
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^https:\/\/([a-z0-9-]+-dot-)?pos-application-358116\.[a-z0-9]+\.r\.appspot\.com$/,
];

const isAllowedOrigin = (origin) => ALLOWED_ORIGINS.some((re) => re.test(origin));

const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });

const printerFrom = (url) => {
  const host = url.searchParams.get("host") || "";
  const port = Number(url.searchParams.get("port"));
  if (!host) throw badRequest("Printer host missing. Set PRINTER_HOST in Settings > App Settings.");
  if (!HOST_PATTERN.test(host)) throw badRequest(`Invalid printer host "${host}"`);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw badRequest(`Invalid printer port "${url.searchParams.get("port") || ""}"`);
  }
  return { host, port };
};

const connectToPrinter = (printer, timeoutMs) => {
  const socket = net.connect(printer);
  socket.setTimeout(timeoutMs, () =>
    socket.destroy(new Error(`Printer ${printer.host}:${printer.port} timed out`))
  );
  return socket;
};

const checkPrinter = (printer) =>
  new Promise((resolve, reject) => {
    const socket = connectToPrinter(printer, 3000);
    socket.on("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.on("error", reject);
  });

const sendToPrinter = (printer, data) =>
  new Promise((resolve, reject) => {
    const socket = connectToPrinter(printer, 10000);
    socket.on("error", reject);
    socket.end(data, (err) => (err ? reject(err) : resolve()));
  });

// A printer handles one job at a time, so jobs are sent in order.
let queue = Promise.resolve();
const enqueue = (printer, data) => {
  const job = queue.then(() => sendToPrinter(printer, data));
  queue = job.catch(() => {});
  return job;
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JOB_BYTES) {
        reject(new Error("Print job too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    if (!isAllowedOrigin(origin)) {
      res.writeHead(403).end("Origin not allowed");
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res
      .writeHead(204, {
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Private-Network": "true",
      })
      .end();
    return;
  }

  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/status") {
      const printer = printerFrom(url);
      await checkPrinter(printer);
      res.writeHead(200).end(`Printer ${printer.host}:${printer.port} is reachable`);
    } else if (req.method === "POST" && url.pathname === "/print") {
      const printer = printerFrom(url);
      const data = await readBody(req);
      if (data.length === 0) {
        res.writeHead(400).end("Empty print job");
        return;
      }
      await enqueue(printer, data);
      console.log(`${new Date().toLocaleString()} printed ${data.length} bytes on ${printer.host}:${printer.port}`);
      res.writeHead(200).end("Printed");
    } else {
      res.writeHead(404).end("Not found");
    }
  } catch (error) {
    console.error(`${new Date().toLocaleString()} ${error.message}`);
    res.writeHead(error.statusCode || 502).end(error.message);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Print server on http://127.0.0.1:${PORT} (printer address comes from App Settings)`);
});
