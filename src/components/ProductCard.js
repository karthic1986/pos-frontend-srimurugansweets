import React, { useState } from "react";
import "../styles/productCard.css";
import EditQtyModal from "./Modal/EditQtyModal";
import { dispatch } from "../reducers/productReducer";
import { GET_ACTIVE_PRODUCTS } from "../actions/type";

const ProductCard = (props) => {
  var prod = props.prod;
  var prodList = props.prodList;

  const [showModal, setShowModel] = useState(false);

  const toggleModal = () => {
    setShowModel(!showModal);
  };

  const qtyValue = (q) => {
    prod.qty = q;
    prod.total = q * prod.price;
    dispatch({
      payload: prodList,
      type: GET_ACTIVE_PRODUCTS,
    });
   props.calcTotalQtyAndTotalAmt();
  };

 
  return (
    <div className="col-md-3 col-sm-6 col-12" key={prod.id} id="cardItem">
      <div className="info-box">
        <div className="info-box-content">
          <span className="info-box-text">
            <h5>{prod.name}</h5>
          </span>
          <span className="info-box-text">
            <h6>Price: {prod.price}</h6>
          </span>
          <span className="info-box-text">
            <h6>Qty: {prod.qty}</h6>
          </span>
        </div>
        <span className="info-circle-icon bg-success" onClick={toggleModal}>
          <i className="fas fa-plus"></i>
        </span>
      </div>
      <EditQtyModal
        qty={prod.qty}
        isOpen={showModal}
        toggle={toggleModal}
        heading={prod.name}
        value={qtyValue}
      />
    </div>
  );
};

export default ProductCard;

// <div className="col-md-3 col-sm-6 col-12" key={prod.id} id='cardItem'>
//   <div className="info-box" >
//   {/* <div className="info-box" onClick={toggleModal}> */}
//     <span className="info-circle-icon bg-danger" onClick={decreareQtyValue}><i className="fas fa-arrow-down"></i></span>

//     {/*<span className="info-box-icon bg-info">
//       <img src={img} alt="User Image" />
//     </span> */}
//     <div className="info-box-content">
//       <span className="info-box-text">{prod.name}</span>
//       <span className="info-box-number">₹{prod.price} X {prod.qty} = ₹{prod.total} </span>
//     </div>
//     <span className="info-circle-icon bg-success" onClick={increareQtyValue}><i className="fas fa-arrow-up"></i></span>

//   </div>
//   <EditQtyModal
//     isOpen={showModal}
//     toggle={toggleModal}
//     heading={prod.name}
//     value={qtyValue}
//   />
// </div>

// <div className="col-lg-3 col-6" key={prod.id} id='cardItem'>
//   <div className="small-box" onClick={toggleModal}>
//     <div className="inner">
//       <h5>{prod.name}</h5>
//     </div>

//     <div className="card-footer">
//       <div className="row">
//         <div className="col-sm-4 border-right">
//           <div className="description-block">
//             <h5 className="description-header">{prod.price}</h5>
//             {/* <span className="description-text">₹</span> */}
//             <span className="description-text">Price</span>
//           </div>
//         </div>

//         <div className="col-sm-4 border-right">
//           <div className="description-block">
//             <h5 className="description-header">{prod.qty}</h5>
//             <span className="description-text">Qty</span>
//           </div>
//         </div>

//         <div className="col-sm-4">
//           <div className="description-block">
//             <h5 className="description-header">{prod.total}</h5>
//             <span className="description-text">Total</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// <EditQtyModal
//   isOpen={showModal}
//   toggle={toggleModal}
//   heading={prod.name}
//   value={qtyValue}
// />
// </div>

// <div >
//   <div className='cardDiv'>
//     <Card className='shadow' onClick={toggleModal}>
//       <Card.Img variant='top' className='img' src={img} alt='Snacks & Sweets' />
//       <Card.Body>
//         <Card.Title className='title'>{prod.name}</Card.Title>
//         <Card.Subtitle className='subTitle'>Price: {prod.price}</Card.Subtitle>
//         <Card.Text className='text'>Qty - {prod.qty}</Card.Text>
//       </Card.Body>
//     </Card>
//     <EditQtyModal
//       isOpen={showModal}
//       toggle={toggleModal}
//       heading={prod.name}
//       value={qtyValue}
//     />
//   </div>
// </div>

//   <div className="col-md-3 col-sm-6 col-12" key={prod.id} id='cardItem'>
//   <div className="info-box" >
//     <div className="info-box-content">
//       <span className="info-box-text"><h4>{prod.name}</h4></span>
//       <span className="info-box-number">₹{prod.price} X {prod.qty} = ₹{prod.total} </span>
//     </div>
//     <span className="info-circle-icon bg-success" onClick={toggleModal}><i className="fas fa-plus"></i></span>

//   </div>
//   <EditQtyModal
//     isOpen={showModal}
//     toggle={toggleModal}
//     heading={prod.name}
//     value={qtyValue}
//   />
// </div>


// const increareQtyValue = () => {
//   console.log(prod.qty);
//   prod.qty = prod.qty + 1;
//   prod.total = prod.qty * prod.price;

//   dispatch({
//     payload: prodList,
//     type: GET_ACTIVE_PRODUCTS,
//   });

//   console.log(prodList);
// };

// const decreareQtyValue = () => {
//   prod.qty = prod.qty - 1;
//   if (prod.qty < 0) prod.qty = 0;
//   prod.total = prod.qty * prod.price;

//   dispatch({
//     payload: prodList,
//     type: GET_ACTIVE_PRODUCTS,
//   });
// };
