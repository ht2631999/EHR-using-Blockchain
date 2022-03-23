import React, { Component } from 'react';
import {Card} from 'antd';

class displayConsultation extends Component{ 
    render(){

    let {doctor_id,consultation_advice, medicine, time_period} = this.props.props;
    let that =this.props.that;

    
    return(
        <div>
            <Card>
            <h6>Doctor ID</h6><br></br>
            <p >{doctor_id}</p>
            <h6>Consultation</h6><br></br>
            <p >{consultation_advice}</p>
            <h6>medicine</h6><br></br>
            <p >{medicine}</p>
            <h6>Time period</h6><br></br>
            <p >{time_period}</p>
            </Card>
        </div>
    );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}

export default displayConsultation;