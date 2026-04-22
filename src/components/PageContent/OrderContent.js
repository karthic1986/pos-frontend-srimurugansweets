import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { getActiveProductsSvc, addProductSvc } from "../../actions/productAction";
import { useStoreState, dispatch } from "../../reducers/productReducer";
import AddProdQtyModal from "../../components/Modal/AddProdQtyModal";
import { Link } from "react-router-dom";
import { GET_ACTIVE_PRODUCTS } from "../../actions/type";

const OrderContent = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const prodList = useStoreState("productList");
  const cartCount = useStoreState("cartCount");
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmt, setTotalAmt] = useState(0);

  const toggleAddModal = () => {
    setShowAddModal(!showAddModal);
  };

  const calcTotalQtyAndTotalAmt = () => {
    let totQty = 0;
    prodList.map((prod) => {
      if (prod.qty > 0) totQty = totQty + prod.qty;
    });
    let totAmt = 0;
    prodList.map((prod) => {
      if (prod.qty > 0) totAmt = totAmt + prod.qty * prod.price;
    });

    setTotalQty(totQty);
    setTotalAmt(totAmt);
  };

  const payloadFunction = (q, price, name) => {
    console.log(q, price, name);
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
    prodList.push(state);
    console.log(prodList);
    dispatch({
      payload: prodList,
      type: GET_ACTIVE_PRODUCTS,
    });

    calcTotalQtyAndTotalAmt();
  };

  useEffect(() => {
    if (prodList.length == 0) getActiveProductsSvc();

    calcTotalQtyAndTotalAmt();
  }, []);

  return (
    // <!-- Content Wrapper. Contains page content -->
    <div className="content-wrapper">
      {/* <!-- Content Header (Page header) --> */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Order</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Order</li>
              </ol>
            </div>
          </div>
        </div>
        {/* <!-- /.container-fluid --> */}
      </section>

      <section className="content">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Product List</h3>
            <div className="card-tools">
              {cartCount > 0 && (
                <Link to="/cart">
                  <button type="button" className="btn btn-tool">
                    <i className="fas fa-shopping-cart"></i>&nbsp;&nbsp;Cart(
                    {cartCount})
                  </button>
                </Link>
              )}
              <button type="button" className="btn btn-tool" onClick={toggleAddModal}>
                <i className="fas fa-plus"></i>&nbsp;&nbsp;Product
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col">Total Quantity: {totalQty}</div>
              <div className="col">Total Amount: ₹{totalAmt}</div>
            </div>
            <div className="row">
              {prodList.map((prod) => {
                return <ProductCard key={prod.id} prod={prod} prodList={prodList} calcTotalQtyAndTotalAmt={calcTotalQtyAndTotalAmt} />;
              })}
            </div>

            <AddProdQtyModal isOpen={showAddModal} toggle={toggleAddModal} payload={payloadFunction} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderContent;

{
  /* <Row>
              {prodList.map(prod => {
                return (
                  <Col key={prod.id} id='cardItem' className='col-sm-auto' >
                    <ProductCard prod={prod} prodList={prodList} />
                  </Col>);
              })}
            </Row> */
}
