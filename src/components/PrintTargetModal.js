import React from "react";
import { ConfigProvider, Modal } from "antd";
import { DesktopOutlined, MobileOutlined, PrinterOutlined } from "@ant-design/icons";
import POS_THEME from "../styles/posTheme";
import { isBluetoothSupported } from "./BluetoothPrint";
import "../styles/pos.css";
import "../styles/printTarget.css";

// Asks where to print an order's bill: the same choices as the order screen's
// "Print on". The device's default is marked and focused, so Enter prints there.
// bluetoothPrinter: the printer picked on the order screen, or "" if none yet.
const PrintTargetModal = ({ open, orderId, defaultTarget, bluetoothPrinter, onChoose, onCancel }) => {
    const targets = [
        { value: "thermal", icon: <PrinterOutlined />, title: "Thermal printer", hint: "The counter's receipt printer" },
        { value: "pc", icon: <DesktopOutlined />, title: "This PC", hint: "This device's print dialog" },
        ...(isBluetoothSupported()
            ? [
                  {
                      value: "bluetooth",
                      icon: <MobileOutlined />,
                      title: "Bluetooth",
                      hint: bluetoothPrinter ? `Printer: ${bluetoothPrinter}` : "Pick the printer when printing",
                  },
              ]
            : []),
    ];

    return (
        <ConfigProvider theme={POS_THEME}>
            <Modal
                title={`Print order ${orderId ?? ""}`}
                open={open}
                onCancel={onCancel}
                footer={null}
                width={400}
                centered
                destroyOnHidden
            >
                <div className="pt-options" role="group" aria-label="Print on">
                    {targets.map(({ value, icon, title, hint }) => {
                        const isDefault = value === defaultTarget;
                        return (
                            <button
                                key={value}
                                type="button"
                                className={`pt-option${isDefault ? " is-default" : ""}`}
                                autoFocus={isDefault}
                                onClick={() => onChoose(value)}
                            >
                                <span className="pt-icon" aria-hidden="true">
                                    {icon}
                                </span>
                                <span className="pt-text">
                                    <span className="pt-title">{title}</span>
                                    <span className="pt-hint">{hint}</span>
                                </span>
                                {isDefault && <span className="pt-badge">Default</span>}
                            </button>
                        );
                    })}
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default PrintTargetModal;
