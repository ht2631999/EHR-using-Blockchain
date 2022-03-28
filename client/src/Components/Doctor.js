
import React, { Component } from 'react';
import {Card, Tag } from 'antd';
import DisplayPatient from "./display_patient";
import './css/doctor.css'
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
            <div className='doctorbody'>
                <Card bordered={true}>
                    <div>
                        <b>Name:</b> {name}
                    </div>
                </Card>
                <div>
                    <div>
                        <h5><b>Patient List</b></h5>
                        <Card bordered={true} >
                            { 
                                patient_list.map((patient) => {
                                return <div><Tag onClick={()=>this.setState({load_patient:patient})}>{patient}</Tag></div>
                                }) 
                            }
                        </Card>
                    </div>
					<br/>
                    <div style={{width:'70%'}}>
                        {
                            this.state.load_patient ?
                            <div> <h5>Patients Data <DisplayPatient contract ={this.healthRecord} Acc={this.Acc} patient_address={this.state.load_patient} /> </h5></div> :
                            <div></div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}


export default Doctor;
