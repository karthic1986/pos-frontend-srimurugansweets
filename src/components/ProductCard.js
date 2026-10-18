import React from "react";
import QtyStepper from "./QtyStepper";
import { toNumber, rupees } from "../money";

// A product on the shelf. Tapping the tile adds one; once the product is in
// the order the tile is highlighted and shows a − qty + stepper.
const ProductCard = ({ prod, onSetQty }) => {
  const qty = toNumber(prod.qty);
  const inOrder = qty > 0;

  return (
    <div className={`pos-tile${inOrder ? " is-in-order" : ""}`}>
      <button type="button" className="pos-tile-add" onClick={() => onSetQty(prod, qty + 1)} aria-label={`Add one ${prod.name}, ${rupees(prod.price)}`}>
        <span className="pos-tile-name">{prod.name}</span>
        <span className="pos-tile-price">{rupees(prod.price)}</span>
      </button>
      {inOrder && (
        <div className="pos-tile-foot">
          <QtyStepper qty={qty} label={prod.name} onChange={(value) => onSetQty(prod, value)} />
        </div>
      )}
    </div>
  );
};

export default ProductCard;
