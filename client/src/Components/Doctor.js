
import React, { Component } from 'react';
import {  Row, Col, Card, Tag } from 'antd';
import DisplayPatient from "./display_patient";

class Doctor extends Component {

    constructor(props){
        super(props);
    }
     healthRecord =this.props.contract["OPT"];
     Acc =this.props.Acc;
    state = {
        name: "",
        patient_list: [],
        filesInfo:[],
        load_patient:""
    }

    componentDidMount(){
        
            this.loadDoctor();
    }

    

    async loadDoctor(){
        let res = await this.healthRecord.methods.getDoctorInfo().call({from :this.Acc[0]});
        this.setState({name:res[0],patient_list:res[2]});
    }

    render() {
        let { name, patient_list } = this.state;
        return (
            <div>
                <Card bordered={true}>
                    <div>
                        <b>Name:</b> {name}
                    </div>
                </Card>
                <Row gutter={16} style={{display:"flex",flexDirection:"row",justifyContent:"space-between"}}>
                    <Col className='col-sm-10' span={10}>
                        <Card bordered={true} style={flexStyle}>
                            { 
                                patient_list.map((patient) => {
                                return <div><Tag onClick={()=>this.setState({load_patient:patient})}>{patient}</Tag></div>
                                }) 
                            }
                        </Card>
                    </Col>
					<br/>
                    <Col className='col-sm-6' span={6} style={{width: "58%"}}>
                        {
                            this.state.load_patient ?
                            <div> <b>Patients List</b> <DisplayPatient contract ={this.healthRecord} Acc={this.Acc} patient_address={this.state.load_patient} /></div> :
                            <div></div>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}

const mapStateToProps = (state) => {
    return {
      auth: state.auth,
      global_vars: state.global_vars
    };
};

export default Doctor;
