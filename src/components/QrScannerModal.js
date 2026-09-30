import React, { useEffect, useRef } from "react";
import { Modal } from "antd";
import { Html5Qrcode } from "html5-qrcode";
import CustomToast from "./CustomToast";

const READER_ID = "qr-reader";

const QrScannerModal = ({ open, onClose, onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let started = false;
    // Modal content mounts after open flips, so wait a tick for #qr-reader to exist
    const timer = setTimeout(() => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      let handled = false;
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (handled) return;
            handled = true;
            onScan(decodedText.trim());
            onClose();
          },
          () => {}
        )
        .then(() => {
          started = true;
          if (cancelled) stopScanner();
        })
        .catch((error) => {
          console.log(error);
          CustomToast("error", "Unable to access camera. Please allow camera permission.");
          onClose();
        });
    }, 100);

    const stopScanner = () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (started) stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal title="Scan Order QR Code" open={open} onCancel={onClose} footer={null} destroyOnClose centered>
      <div id={READER_ID} style={{ width: "100%" }} />
    </Modal>
  );
};

export default QrScannerModal;
