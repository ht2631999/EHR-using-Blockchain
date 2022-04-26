import React, { Component } from "react";

import { Card, Tag } from 'antd';
import "./css/InsuranceComp.css"
import DisplayPatientToCompany from "./display_patient_to_company";

class InsuranceComp extends Component{
    //async methods and states here
    contract =this.props.contract['OPT'];
    doctorAddRecord = this.props.contract['DAR'];
    contracts = [this.contract, this.doctorAddRecord];
    accounts =this.props.Acc;

    state = {
        name:"",
        id:"",
        patient_list:[],
        count:0
    }

    

    componentDidMount(){
        this.loadCompany();
    }

    componentDidUpdate(prevProps,prevState){
        console.warn("Updated")
        if(this.state.load_patient != null && this.state.count==0)
        {
            this.setState({load_patient :null})
        }
        console.log(prevState.count, this.state.count)
    }

    async loadCompany(){
        let res= await this.contract.methods.getInsuranceCompInfo().call({from:this.accounts[0]});
        console.log(res);
        this.setState({id:res[0],name:res[1],patient_list:res[2]});
    }

    render(){
        let {name, patient_list, id} = this.state;
        return(
            <div className='container'>
                <Card bordered={true}>
                    <div >
                        <b>Name:</b> {name} <br></br>
                        <b>Address:</b> {id}
                    </div>
                </Card>
                
                <div className='sidebar'>
                        <h5>Patients List</h5>
                        <div>
                            { 
                                patient_list.map((patient) => {
                                return <div className='mt-1'><Tag onClick={()=>{this.setState({load_patient:patient, count: 1-this.state.count})}}>{patient}</Tag></div>
                                }) 
                            }
                        </div>
                </div>
                
                <div className='container'>
                    <div className='row mt-3'>
                    <div className='col'>
                        {
                            this.state.load_patient ?
                            <div> <h5>Patient's Data <DisplayPatientToCompany contract ={this.contracts} accounts={this.accounts} patient_address={this.state.load_patient} /> </h5></div> :
                            <div></div>

                        }
                    </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default InsuranceComp;