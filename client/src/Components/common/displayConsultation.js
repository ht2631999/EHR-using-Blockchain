import React, { Component } from 'react';
import {Card} from 'antd';

class displayConsultation extends Component{ 
    render(){

    let {doctor_id,consultation_advice, medicine, time_period} = this.props.props;

    
    return(
        <div>
            <Card bordered='true' color='blue'>
            <h7><b>Doctor ID</b></h7><br></br>
            <p >{doctor_id}</p>
            <h7><b>Consultation</b></h7><br></br>
            <p >{consultation_advice}</p>
            <h7><b>medicine</b></h7><br></br>
            <p >{medicine}</p>
            <h7><b>Time period</b></h7><br></br>
            <p >{time_period}</p>
            </Card>
        </div>
    );
    }
}


export default displayConsultation;