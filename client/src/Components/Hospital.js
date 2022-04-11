import React, { Component } from 'react';
import {   Input,  message, Tag, Card, Collapse } from 'antd';
import {Button} from 'react-bootstrap';

// import healthRecord from "../contracts/DoctorAddRecord.json"
// import getWeb3 from '../getWeb3';

class Hospital extends Component{
    constructor(props){
        super(props);
        this.grantAccess = this.grantAccess.bind(this);
    }

    contract =this.props.contract['OPT'];
    doctorAddRecord = this.props.contract['DAR'];
    accounts =this.props.Acc;

    state = {
        hosp_name:"",
        hosp_location:"",
        hosp_id:""
    }
    //async methods and states here
    async loadHospital(){
        try{
        let res = await this.contract.methods.getHospitalInfo().call({from:this.accounts[0]});
        this.setState({hosp_id:res[0],hosp_name:res[1],hosp_location:res[2]});
        }
        catch(e){
            console.log(e);
        }
    }


    async grantAccess(event){
        event.preventDefault();
        let requestor = document.getElementById('access_requestor').value;
        let patient = document.getElementById('access_of').value;
        console.log(requestor);
        console.log(patient);
        try{
            let result = await this.contract.methods.hospitalGrantAccess(requestor,patient).send({"from":this.accounts[0]});
            console.log(result);
        }
        catch(e){
            console.log(e)
        }
    }

    componentDidMount(){
        this.loadHospital();
    }
    render(){
        let {hosp_name, hosp_id, hosp_location} = this.state;

        return(
            <div className='container'> 
                <Card>
                    <div >
                        <span><b>Id: </b>{hosp_id}</span> <br></br>
                        <span><b>Name:</b> {hosp_name}</span> <br></br>
                        <span><b>Location: </b>{hosp_location}</span>
                    </div>
                </Card>
                <div className='row'>
                    <form onSubmit={this.grantAccess}>
                    <br></br>
                    <div className="label mt-2"><b>Grant access to</b></div>
                    <input type="text" name="Grant to" id="access_requestor"></input>
                    
                    <br></br>
                    <div className="label mt-2"><b>Access of:</b></div>
                    <input type="text" name="Access of" id="access_of" ></input>
                    
                    <br></br>
                    <Button variant="dark" className="button" type="submit">Grant Access</Button>

                    </form>
                </div>
            </div>
        )
    }
}

export default Hospital;