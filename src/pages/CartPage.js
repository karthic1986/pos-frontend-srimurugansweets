import React, { Component } from 'react';
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import CartContent from '../components/PageContent/CartContent';

class Cart extends Component { 
    render() {
        return (
            <>
                <MainHeader />
                <MainSidebar />
                <CartContent />
                <MainFooter />
            </>
        );
    };
};

export default Cart;

