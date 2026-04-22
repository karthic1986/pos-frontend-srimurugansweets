import React, { Component } from "react";
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import ProductPageContent from "../components/PageContent/ProductPageContent";

class ProductPage extends Component {

    render(){
        return(
            <div>
                <MainHeader/>
                <MainSidebar/>
                <ProductPageContent/>
                <MainFooter/>
            </div>
        );
    };
};

export default ProductPage;