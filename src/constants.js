const MIDDLEWARE_BASE_URL = process.env.REACT_APP_API_URL;
const GIT_Test = "Im from Dev";
module.exports = Object.freeze({
  //auth
  MIDDLEWARE_USERNAME: process.env.REACT_APP_API_BASIC_AUTH_USERNAME,
  MIDDLEWARE_PASSWORD: process.env.REACT_APP_API_BASIC_AUTH_PASSWORD,
  MIDDLEWARE_USER_VALIDATE_URL: MIDDLEWARE_BASE_URL + "/api/users/validate",

  // Order
  MIDDLEWARE_CREATE_ORDER: MIDDLEWARE_BASE_URL + "/api/orders/v1/",

  // Product
  MIDDLEWARE_GET_ACTIVE_PRODUCTS_URL: MIDDLEWARE_BASE_URL + "/api/products/active",
  MIDDLEWARE_PRODUCTS_URL: MIDDLEWARE_BASE_URL + "/api/products/",

  // Category
  MIDDLEWARE_CATEGORIES_URL: MIDDLEWARE_BASE_URL + "/api/categories/",

  // Customer
  MIDDLEWARE_GET_ACTIVE_CUSTOMERS_URL: MIDDLEWARE_BASE_URL + "/api/customers/active",
  MIDDLEWARE_CUSTOMERS_URL: MIDDLEWARE_BASE_URL + "/api/customers/",
  MIDDLEWARE_SEARCH_CUSTOMERS_URL: MIDDLEWARE_BASE_URL + "/api/customers/search?mobile={{mobile}}",

  // Report
  MIDDLEWARE_GET_DELIVERY_REPORT_URL: MIDDLEWARE_BASE_URL + "/api/reports/delivery?fdate={{fDate}}&tdate={{tDate}}",
  MIDDLEWARE_GET_NON_DELIVERY_REPORT_URL: MIDDLEWARE_BASE_URL + "/api/reports/nondelivery?fdate={{fDate}}&tdate={{tDate}}",
  MIDDLEWARE_GET_NON_DELIVERY_REPORT_BY_PRODUCT_URL: MIDDLEWARE_BASE_URL + "/api/reports/nondeliverybyproduct?fdate={{fDate}}&tdate={{tDate}}",
  MIDDLEWARE_GET_REPORT_BY_CUSTOMER_URL: MIDDLEWARE_BASE_URL + "/api/reports/customerwisesales?fdate={{fDate}}&tdate={{tDate}}",
  MIDDLEWARE_GET_REPORT_BY_PRODUCT_URL: MIDDLEWARE_BASE_URL + "/api/reports/productwisesales?fdate={{fDate}}&tdate={{tDate}}",
  MIDDLEWARE_GET_REPORT_BY_DATE_URL: MIDDLEWARE_BASE_URL + "/api/reports/datewisesales?fdate={{fDate}}&tdate={{tDate}}",

  // Delivery
  MIDDLEWARE_GET_SEARCH_RESULT_URL: MIDDLEWARE_BASE_URL + "/api/delivery?s={{searchTerm}}",
  MIDDLEWARE_GET_ORDER_DETAILS_URL: MIDDLEWARE_BASE_URL + "/api/delivery/{{orderID}}",

  // Dashboard
  MIDDLEWARE_GET_LAST_DAYS_SALES_URL: MIDDLEWARE_BASE_URL + "/api/dashboard/last7daysSales",

  // App Settings
  MIDDLEWARE_SETTINGS_URL: MIDDLEWARE_BASE_URL + "/api/settings/",

  //Company details
  COMPANY_DETAILS: '<p style="font-size: 60%">ஸ்ரீ முருகன் துணை</p></br><p style="font-size: 150%">ஸ்ரீ முருகன் டீ ஸ்டால்(ஸ்வீட்ஸ்)</p></br><p style="font-size: 100%">488, பி.என்.ரோடு,திருப்பூர் - 641602</p> </br> <p style="font-size: 100%">www.srimurugansweets.com </p>',
  //Bill footer message is the BILL_FOOTER_MESSAGE app setting (Settings > App Settings)

  //Thermal printer (RP3230), reached through print-server/server.js.
  //Printer address, paper, size, darkness, copies and on/off are App Settings (PRINTER_*, THERMAL_PRINT_ENABLED).
  THERMAL_PRINT_SERVER_URL: "http://127.0.0.1:9101",

  //Flags
  IS_SHOW_DISCOUNT: false,
});
