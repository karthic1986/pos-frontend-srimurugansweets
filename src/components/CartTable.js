import React, { useEffect, useState, useRef } from 'react';

export default function CartTable(props) {
    const cartList = [];
    const myGrid = useRef(null);

    const [totAmt, setTotAmt] = useState(0);
    const [totQty, setTotQty] = useState(0);


    const calcCartTotal = () => {

        props.prodList.map((prod) => {
            if (prod.qty > 0) {
                setTotQty(prevTotQty => (prod.qty + prevTotQty));
                setTotAmt(prevTotAmt => (prod.qty * prod.price) + prevTotAmt);
                cartList.push(prod);
            }
        });

    };


    useEffect(
        () => {
            calcCartTotal();
            buildCartTable();
        }, []);


    const buildCartTable = () => {

        window.jQuery(myGrid.current).jsGrid({
            height: "auto",
            width: "100%",
            sorting: true,
            paging: true,
            footerrow: true,
            data: cartList,
            fields: [
                { name: "id", type: "text", title: "Product Code" },
                { name: "name", type: "text", title: "Name" },
                { name: "qty", type: "number", title: "Qty" },
                { name: "price", type: "number", title: "Price" },
                { name: "total", type: "number", title: "Total" }
            ]
        });
    };


    return (

        <div id="jsGrid1" ref={myGrid}></div>

    )
}


 // <MDBTable>
        //    <MDBTableHead >
        //         <tr className='table-primary'>
        //         <th></th>
        //         <th>Product</th>
        //         <th>Quantity</th>
        //         <th>Price</th>
        //         <th>Total</th>
        //         </tr>
        //     </MDBTableHead>
        //     <MDBTableBody>
        //          {cartList.map(renderList)}
        //      </MDBTableBody>
        //      <tfoot>
        //         <tr>
        //         <td colSpan={2}>Total Quantity</td>
        //         <td>{totQty}</td>
        //         <td >Total Amount</td>
        //         <td>{totAmt}</td>
        //         </tr>
        //      </tfoot>
        // </MDBTable> 
