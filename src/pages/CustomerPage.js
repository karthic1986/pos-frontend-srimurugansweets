import React, { Component } from "react";
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import CustomerPageContent from "../components/PageContent/CustomerPageContent";

class CustomerPage extends Component {
    render(){
        return(
            <div>
                <MainHeader/>
                <MainSidebar/>
                <CustomerPageContent/>
                <MainFooter/>
            </div>
        );
    };
};

export default CustomerPage;