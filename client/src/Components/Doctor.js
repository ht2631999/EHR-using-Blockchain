
import React, { Component} from 'react';
import { Card, Tag } from 'antd';
import DisplayPatient from "./display_patient";
import './css/doctor.css'
class Doctor extends Component {

   
    healthRecord =this.props.contract["OPT"];
    doctorAddFiles= this.props.contract["DAR"];
    contracts=[this.healthRecord, this.doctorAddFiles];
    Acc =this.props.Acc;
    state = {
        name: "",
        patient_list: [],
        filesInfo:[]
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
                    <div >
                        <b>Name:</b> {name}
                    </div>
                </Card>
                
                <div className='sidebar'>
                        <h5>Patients List</h5>
                        <ul>
                            { 
                                patient_list.map((patient) => {
                                return <div className='mt-1'><Tag onClick={()=>{this.setState({load_patient:patient});}}>{patient}</Tag></div>
                                }) 
                            }
                        </ul>
                </div>
                
                <div className='container'>
                    <div className='row mt-3'>
                    <div className='col'>
                        {
                            this.state.load_patient ?
                            <div> <h5>Patient's Data <DisplayPatient contract ={this.contracts} Acc={this.Acc} patient_address={this.state.load_patient} /> </h5></div> :
                            <div></div>

                        }
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default Doctor;
