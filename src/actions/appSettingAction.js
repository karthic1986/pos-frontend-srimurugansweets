import axios from "axios";
import constants from "../constants";

const auth = {
  username: constants.MIDDLEWARE_USERNAME,
  password: constants.MIDDLEWARE_PASSWORD,
};

export const getAppSettingsSvc = async () => {
  return await axios.get(constants.MIDDLEWARE_SETTINGS_URL, { auth });
};

export const addAppSettingSvc = async (content) => {
  return await axios.post(constants.MIDDLEWARE_SETTINGS_URL, content, { auth });
};

export const editAppSettingSvc = async (id, content) => {
  return await axios.put(constants.MIDDLEWARE_SETTINGS_URL + `${id}`, content, { auth });
};

export const deleteAppSettingSvc = async (id) => {
  return await axios.delete(constants.MIDDLEWARE_SETTINGS_URL + `${id}`, { auth });
};

// THERMAL_PRINT_ENABLED: anything but "false" means the thermal printer.
export const isThermalPrintEnabled = (settings) =>
  (settings.THERMAL_PRINT_ENABLED || "").trim().toLowerCase() !== "false";

// THERMAL_PRINT_METHOD: "print-server" sends thermal bills through print-server/server.js;
// anything else prints them with the browser, through the printer's own driver.
export const isPrintServerMethod = (settings) =>
  (settings.THERMAL_PRINT_METHOD || "").trim().toLowerCase() === "print-server";

// All settings as { NAME: value }. A setting that doesn't exist is undefined.
export const getAppSettingsMap = async () => {
  const res = await getAppSettingsSvc();
  const settings = {};
  (res.data || []).forEach((s) => {
    settings[s.name] = s.value || "";
  });
  return settings;
};
