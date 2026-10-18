import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input, Button, Popconfirm, ConfigProvider } from "antd";
import { SearchOutlined, PlusOutlined, ShoppingOutlined, ArrowRightOutlined } from "@ant-design/icons";
import ProductCard from "../../components/ProductCard";
import QtyStepper from "../QtyStepper";
import { getActiveProductsSvc, addProductSvc } from "../../actions/productAction";
import { getEntireCategoriesSvc } from "../../actions/categoryAction";
import { useStoreState, dispatch } from "../../reducers/productReducer";
import { useStoreState as useStoreStateDelivery } from "../../reducers/deliveryReducer";
import AddProdQtyModal from "../../components/Modal/AddProdQtyModal";
import { GET_ACTIVE_PRODUCTS } from "../../actions/type";
import history from "../../history";
import { toNumber, rupees } from "../../money";
import POS_THEME from "../../styles/posTheme";
import "../../styles/pos.css";

const matchesSearch = (prod, term) =>
  [prod.name, prod.printName, prod.shortName].some((value) => value && String(value).toLowerCase().includes(term));

const OrderContent = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const prodList = useStoreState("productList");
  const [loading, setLoading] = useState(prodList.length === 0);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const isOrderFromEdit = useStoreStateDelivery("isOrderFromEdit");
  const editingOrder = useStoreStateDelivery("orderDetails").order;

  // On desktop the shelf and ticket fill the window below the page header and
  // scroll on their own; orderPage.css sizes them from this measured offset.
  const orderRef = useRef(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = orderRef.current;
      if (el) el.style.setProperty("--pos-order-top", `${el.getBoundingClientRect().top + window.scrollY}px`);
    };
    measure();
    if (document.fonts) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  // Quantities live on the product objects (the Cart reads them from there);
  // dispatching a new array re-renders the shelf and the ticket.
  const setQty = (prod, qty) => {
    prod.qty = qty;
    prod.total = qty * prod.price;
    dispatch({ payload: [...prodList], type: GET_ACTIVE_PRODUCTS });
  };

  const clearOrder = () => {
    prodList.forEach((prod) => {
      prod.qty = 0;
      prod.total = 0;
    });
    dispatch({ payload: [...prodList], type: GET_ACTIVE_PRODUCTS });
  };

  const payloadFunction = (q, price, name) => {
    const state = {
      name: name,
      categoryId: 1,
      shortName: "sname",
      price: price,
      isActive: true,
    };
    addProductSvc(state).then((res) => {
      state.id = res.data.id;
    });
    state.qty = q;
    dispatch({ payload: [...prodList, state], type: GET_ACTIVE_PRODUCTS });
  };

  useEffect(() => {
    if (prodList.length === 0) getActiveProductsSvc().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getEntireCategoriesSvc().then((res) => {
      setCategories(res.data || []);
    });
  }, []);

  const term = search.trim().toLowerCase();
  const inCategory =
    selectedCategoryId === "" ? prodList : prodList.filter((prod) => String(prod.categoryId) === String(selectedCategoryId));
  const shown = term ? inCategory.filter((prod) => matchesSearch(prod, term)) : inCategory;

  const countByCategory = {};
  prodList.forEach((prod) => {
    countByCategory[prod.categoryId] = (countByCategory[prod.categoryId] || 0) + 1;
  });

  const orderItems = prodList.filter((prod) => toNumber(prod.qty) > 0);
  const totalQty = orderItems.reduce((sum, prod) => sum + toNumber(prod.qty), 0);
  const totalAmt = orderItems.reduce((sum, prod) => sum + toNumber(prod.qty) * toNumber(prod.price), 0);

  // Enter in the search box adds the product when exactly one matches.
  const handleSearchEnter = () => {
    if (!term || shown.length !== 1) return;
    setQty(shown[0], toNumber(shown[0].qty) + 1);
    setSearch("");
  };

  const pageTitle = isOrderFromEdit ? `Edit order #${editingOrder?.id}` : "New order";
  const checkoutLabel = isOrderFromEdit ? "Continue" : "Checkout";
  const goToCheckout = () => history.push("/cart");

  let shelfMeta;
  if (loading) shelfMeta = "Loading products…";
  else if (term && shown.length === 1) shelfMeta = `Press Enter to add ${shown[0].name}`;
  else if (shown.length !== prodList.length) shelfMeta = `${shown.length} of ${prodList.length} products`;
  else shelfMeta = `${prodList.length} products`;

  const chip = (key, label, count, active, onClick) => (
    <button key={key} type="button" className="pos-chip" aria-pressed={active} onClick={onClick}>
      {label}
      <span className="pos-chip-count">{count}</span>
    </button>
  );

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>{pageTitle}</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/dashboard">Home</a>
                </li>
                <li className="breadcrumb-item active">{pageTitle}</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <ConfigProvider theme={POS_THEME}>
          <div className="pos-order" ref={orderRef}>
            <section className="pos-panel pos-shelf" aria-label="Products">
              <div className="pos-shelf-head">
                <div className="pos-toolbar">
                  <Input
                    size="large"
                    allowClear
                    prefix={<SearchOutlined className="pos-search-icon" />}
                    placeholder="Search products"
                    aria-label="Search products"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearchEnter}
                  />
                  <Button size="large" icon={<PlusOutlined />} onClick={toggleAddModal} aria-label="New product" title="New product">
                    <span className="pos-btn-label">New product</span>
                  </Button>
                </div>
                <div className="pos-chips" role="group" aria-label="Filter by category">
                  {chip("all", "All", prodList.length, selectedCategoryId === "", () => setSelectedCategoryId(""))}
                  {categories.map((c) =>
                    chip(c.id, c.name, countByCategory[c.id] || 0, String(selectedCategoryId) === String(c.id), () => setSelectedCategoryId(c.id))
                  )}
                </div>
                <p className="pos-shelf-meta" aria-live="polite">
                  {shelfMeta}
                </p>
              </div>

              <div className="pos-shelf-body">
                {loading ? (
                  <div className="pos-grid" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="pos-tile pos-tile-skeleton" />
                    ))}
                  </div>
                ) : shown.length === 0 ? (
                  <div className="pos-empty">
                    <SearchOutlined className="pos-empty-icon" />
                    {term ? (
                      <>
                        <p className="pos-empty-title">No products match “{search.trim()}”</p>
                        <Button type="link" onClick={() => setSearch("")}>
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="pos-empty-title">No products here</p>
                        <p className="pos-empty-text">Pick another category, or add products on the Products page.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="pos-grid">
                    {shown.map((prod, i) => (
                      <ProductCard key={prod.id ?? `new-${i}`} prod={prod} onSetQty={setQty} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="pos-panel pos-ticket" aria-labelledby="pos-ticket-title">
              <header className="pos-ticket-head">
                <h2 className="pos-ticket-title" id="pos-ticket-title">
                  Current order
                </h2>
                {orderItems.length > 0 && (
                  <Popconfirm
                    title="Clear this order?"
                    description="All items will be removed."
                    okText="Clear"
                    okButtonProps={{ danger: true }}
                    cancelText="Keep"
                    onConfirm={clearOrder}
                  >
                    <Button type="text" className="pos-ticket-clear">
                      Clear
                    </Button>
                  </Popconfirm>
                )}
              </header>

              {orderItems.length === 0 ? (
                <div className="pos-ticket-empty">
                  <ShoppingOutlined className="pos-empty-icon" />
                  <p className="pos-empty-title">No items yet</p>
                  <p className="pos-empty-text">Tap a product to add it.</p>
                </div>
              ) : (
                <ul className="pos-ticket-items">
                  {orderItems.map((prod, i) => (
                    <li key={prod.id ?? `new-${i}`} className="pos-ticket-item">
                      <span className="pos-ticket-name">{prod.name}</span>
                      <span className="pos-ticket-amount">{rupees(toNumber(prod.qty) * toNumber(prod.price))}</span>
                      <div className="pos-ticket-qty">
                        <QtyStepper size="small" qty={toNumber(prod.qty)} label={prod.name} onChange={(value) => setQty(prod, value)} />
                        <span className="pos-ticket-each">× {rupees(prod.price)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pos-rule" aria-hidden="true" />
              <div className="pos-ticket-total">
                <span className="pos-ticket-total-label">
                  Total · {totalQty} {totalQty === 1 ? "item" : "items"}
                </span>
                <span className="pos-ticket-total-amount">{rupees(totalAmt)}</span>
              </div>
              <div className="pos-ticket-actions">
                <Button type="primary" size="large" block className="pos-checkout" disabled={orderItems.length === 0} onClick={goToCheckout}>
                  {checkoutLabel} <ArrowRightOutlined />
                </Button>
              </div>
            </aside>

            {/* Below 1200px the ticket is replaced by this bar pinned to the bottom. */}
            <div className="pos-bar">
              <div className="pos-bar-summary">
                <span className="pos-bar-count">
                  {totalQty} {totalQty === 1 ? "item" : "items"}
                </span>
                <span className="pos-bar-amount">{rupees(totalAmt)}</span>
              </div>
              <Button type="primary" size="large" className="pos-checkout" disabled={orderItems.length === 0} onClick={goToCheckout}>
                {checkoutLabel} <ArrowRightOutlined />
              </Button>
            </div>
          </div>

          <AddProdQtyModal isOpen={showAddModal} toggle={toggleAddModal} payload={payloadFunction} />
        </ConfigProvider>
      </section>
    </div>
  );
};

export default OrderContent;
