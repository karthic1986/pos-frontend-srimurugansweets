import React, {  useEffect,useState } from "react";
import { last7daysSales } from "../actions/dashboardAction";
import {  format,parseISO } from 'date-fns'
const DashboardContent = () => {

  const [total7DaysSalesAmount,setTotal7DaysSalesAmount] = useState(0);

  useEffect(
    ()=>{
    loadChart();
    },[]);

  async function loadChart() {
    'use strict'
  
    var ticksStyle = {
      fontColor: '#495057',
      fontStyle: 'bold'
    }
  
    var mode = 'index'
    var intersect = true
  
    // var $salesChart = $('#sales-chart')
    // // eslint-disable-next-line no-unused-vars
    // var salesChart = new Chart($salesChart, {
    //   type: 'bar',
    //   data: {
    //     labels: ['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    //     datasets: [
    //       {
    //         backgroundColor: '#007bff',
    //         borderColor: '#007bff',
    //         data: [1000, 2000, 3000, 2500, 2700, 2500, 3000]
    //       },
    //       {
    //         backgroundColor: '#ced4da',
    //         borderColor: '#ced4da',
    //         data: [700, 1700, 2700, 2000, 1800, 1500, 2000]
    //       }
    //     ]
    //   },
    //   options: {
    //     maintainAspectRatio: false,
    //     tooltips: {
    //       mode: mode,
    //       intersect: intersect
    //     },
    //     hover: {
    //       mode: mode,
    //       intersect: intersect
    //     },
    //     legend: {
    //       display: false
    //     },
    //     scales: {
    //       yAxes: [{
    //         // display: false,
    //         gridLines: {
    //           display: true,
    //           lineWidth: '4px',
    //           color: 'rgba(0, 0, 0, .2)',
    //           zeroLineColor: 'transparent'
    //         },
    //         ticks: $.extend({
    //           beginAtZero: true,
  
    //           // Include a dollar sign in the ticks
    //           callback: function (value) {
    //             if (value >= 1000) {
    //               value /= 1000
    //               value += 'k'
    //             }
  
    //             return '$' + value
    //           }
    //         }, ticksStyle)
    //       }],
    //       xAxes: [{
    //         display: true,
    //         gridLines: {
    //           display: false
    //         },
    //         ticks: ticksStyle
    //       }]
    //     }
    //   }
    // })

    let xAxisValue=[];
    let yAxisValue=[];
    let totalSales=0;

    let res = await last7daysSales();
    if(res.data!==null){
      console.log(res.data);    
      res.data.map((item)=>{
        xAxisValue.push(format(parseISO(item.orderDate+'T14:00:00'), 'MMMdd'));
        yAxisValue.push(item.totalAmount);
        totalSales = totalSales+ item.totalAmount;
      });
    }
    else{
      CustomToast("error", "Try again");
      console.log(res.status);  
    }
    setTotal7DaysSalesAmount(totalSales);
    console.log(xAxisValue);
    console.log(yAxisValue);
  
    var $last7dayssales = $('#last7dayssales-chart')
    // eslint-disable-next-line no-unused-vars

    

    

    var last7dayssales = new Chart($last7dayssales, {
      data: {
        labels: xAxisValue,
        datasets: [{
          type: 'line',
          data: yAxisValue,
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          pointBorderColor: '#007bff',
          pointBackgroundColor: '#007bff',
          fill: false
          // pointHoverBackgroundColor: '#007bff',
          // pointHoverBorderColor    : '#007bff'
        }
      ]
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          mode: mode,
          intersect: intersect
        },
        hover: {
          mode: mode,
          intersect: intersect
        },
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            // display: false,
            gridLines: {
              display: true,
              lineWidth: '4px',
              color: 'rgba(0, 0, 0, .2)',
              zeroLineColor: 'transparent'
            },
            ticks: $.extend({
              beginAtZero: true,
              suggestedMax: 200
            }, ticksStyle)
          }],
          xAxes: [{
            display: true,
            gridLines: {
              display: false
            },
            ticks: ticksStyle
          }]
        }
      }
    })
  }

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header border-0">
                  <div className="d-flex justify-content-between">
                    <h3 className="card-title">Sales</h3>
                    {/* <a href="javascript:void(0);">View Report</a> */}
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex">
                    <p className="d-flex flex-column">
                      <span className="text-bold text-lg">₹ {total7DaysSalesAmount}</span>
                      <span>Last 7 days Sales</span>
                    </p>
                    {/* <p className="ml-auto d-flex flex-column text-right">
                      <span className="text-success">
                        <i className="fas fa-arrow-up"></i> 12.5%
                      </span>
                      <span className="text-muted">Since last week</span>
                    </p> */}
                  </div>


                  <div className="position-relative mb-4">
                    <canvas id="last7dayssales-chart" height="200"></canvas>
                  </div>

                  <div className="d-flex flex-row justify-content-end">
                    <span className="mr-2">
                      <i className="fas fa-square text-primary"></i> This Week
                    </span>

                    {/* <span>
                      <i className="fas fa-square text-gray"></i> Last Week
                    </span> */}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="col-lg-6">
              <div className="card">
                <div className="card-header border-0">
                  <div className="d-flex justify-content-between">
                    <h3 className="card-title">Sales</h3>
                    <a href="javascript:void(0);">View Report</a>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex">
                    <p className="d-flex flex-column">
                      <span className="text-bold text-lg">$18,230.00</span>
                      <span>Sales Over Time</span>
                    </p>
                    <p className="ml-auto d-flex flex-column text-right">
                      <span className="text-success">
                        <i className="fas fa-arrow-up"></i> 33.1%
                      </span>
                      <span className="text-muted">Since last month</span>
                    </p>
                  </div>

                  <div className="position-relative mb-4">
                    <canvas id="sales-chart" height="200"></canvas>
                  </div>

                  <div className="d-flex flex-row justify-content-end">
                    <span className="mr-2">
                      <i className="fas fa-square text-primary"></i> This year
                    </span>

                    <span>
                      <i className="fas fa-square text-gray"></i> Last year
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};



export default DashboardContent;