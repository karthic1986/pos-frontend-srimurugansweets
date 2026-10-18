export const toNumber = (value) => Number(value) || 0;

// Indian digit grouping, e.g. ₹1,23,456
export const rupees = (value) => `₹${toNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
