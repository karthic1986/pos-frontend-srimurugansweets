import React, { Component } from "react";
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import DeliveryPageContent from "../components/PageContent/DeliveryPageContent";

class DeliveryPage extends Component {
    render(){
        return(
            <div>
                <MainHeader/>
                <MainSidebar/>
                <DeliveryPageContent/>
                <MainFooter/>
            </div>
        );
    };
};

export default DeliveryPage;