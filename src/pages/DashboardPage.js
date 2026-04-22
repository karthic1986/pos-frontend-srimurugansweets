import React, { Component } from 'react';
import MainHeader from '../components/MainHeader';
import MainSidebar from '../components/MainSidebar';
import MainFooter from '../components/MainFooter';
import DashboardContent from '../components/DashboardContent';


class Dashboard extends Component {
    render() {
        return (

            <>
                <MainHeader />
                <MainSidebar />
                <DashboardContent />
                <MainFooter />
            </>

        );

    }
};

export default Dashboard;