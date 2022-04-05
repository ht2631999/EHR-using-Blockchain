import React, { Component } from 'react';
import {Card} from 'antd';

class displayConsultation extends Component{ 
    render(){

    let {doctor_id,consultation_advice, medicine, time_period} = this.props.props;

    
    return(
        <div>
            <Card bordered='true' color='blue'>
             <b>Doctor ID</b> <br></br>
            <p >{doctor_id}</p>
             <b>Consultation</b> <br></br>
            <p >{consultation_advice}</p>
             <b>medicine</b> <br></br>
            <p >{medicine}</p>
             <b>Time period</b> <br></br>
            <p >{time_period}</p>
            </Card>
        </div>
    );
    }
}


export default displayConsultation;