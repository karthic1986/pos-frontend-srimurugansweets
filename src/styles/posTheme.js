// antd theme for the counter screens (Order, Cart), matching src/styles/pos.css:
// the same accent, 8px radius, 44px touch-size large controls, and inset
// (slightly darker) inputs.
const POS_THEME = {
  token: {
    colorPrimary: "#0d6efd",
    borderRadius: 8,
    controlHeightLG: 44,
    fontFamily: "inherit",
  },
  components: {
    Input: { colorBgContainer: "#f6f8fa", activeBg: "#ffffff", hoverBg: "#f6f8fa" },
  },
};

export default POS_THEME;
