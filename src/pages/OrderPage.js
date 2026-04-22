import React, { Component } from 'react';

import '../styles/orderPage.css'
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import OrderContent from '../components/PageContent/OrderContent';


//const OrderPage = () => {

class OrderPage extends Component {

    // const [showAddModal,setShowAddModal] = useState(false);
    // const prodList = useStoreState('productList');

    // const toggleAddModal = () => {
    // setShowAddModal(!showAddModal);
    // }

    // const payloadFunction =(q,price,name)=>{
    // console.log(q,price,name);
    // const state = {
    //     name:name,
    //     categoryId:1,
    //     shortName:"sname",
    //     price:price,
    //     isActive:true
    // }
    // addProduct(state);

    // }

    // useEffect(() => {
    //     getActiveProducts();
    // }, []); 



    render() {
        return (
            <>
                <MainHeader />
                <MainSidebar />
                <OrderContent />
                <MainFooter />
            </>
        );
    };
};
export default OrderPage;