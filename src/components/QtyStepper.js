import React, { useRef, useState } from "react";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

// − [qty] + control. Typing a number is kept as a draft and applied on Enter
// or blur (Escape discards it), so clearing the field to retype doesn't
// remove the item mid-edit.
const QtyStepper = ({ qty, onChange, label, size }) => {
  const [draft, setDraft] = useState(null);
  const discardRef = useRef(false);

  const commit = () => {
    if (discardRef.current || draft === null) {
      discardRef.current = false;
      setDraft(null);
      return;
    }
    const value = parseInt(draft, 10);
    onChange(Number.isNaN(value) || value < 0 ? 0 : value);
    setDraft(null);
  };

  return (
    <div className={`pos-stepper${size === "small" ? " pos-stepper-sm" : ""}`} role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" className="pos-step" aria-label={`Remove one ${label}`} onClick={() => onChange(Math.max(0, qty - 1))}>
        <MinusOutlined />
      </button>
      <input
        className="pos-step-qty"
        type="number"
        inputMode="numeric"
        min="0"
        aria-label={`Quantity of ${label}`}
        value={draft ?? qty}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onWheel={(e) => e.currentTarget.blur()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            discardRef.current = true;
            e.currentTarget.blur();
          }
        }}
      />
      <button type="button" className="pos-step" aria-label={`Add one ${label}`} onClick={() => onChange(qty + 1)}>
        <PlusOutlined />
      </button>
    </div>
  );
};

export default QtyStepper;
