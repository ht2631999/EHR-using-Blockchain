import React, { Component } from 'react';
import {Card} from 'antd';

class displayPayments extends Component{ 
    render(){

    let {from,to, amount, context, isDoctor} = this.props.props;

    if(isDoctor)
    {
        return(
            <div>
                <Card bordered='true' color='blue'>
                <b>From</b> <br></br>
                <p >{from}</p>
                <b>Amount</b> <br></br>
                <p >{amount}</p>
                <b>context</b> <br></br>
                <p >{context}</p>
                </Card>
            </div>
        );
    }

    else{
        
        return(
            <div>
                <Card bordered='true' color='blue'>
                <b>To</b> <br></br>
                <p >{to}</p>
                <b>Amount</b> <br></br>
                <p >{amount}</p>
                <b>context</b> <br></br>
                <p >{context}</p>
                </Card>
            </div>
        );
    }
}
}


export default displayPayments;