import React, { Component, } from 'react';

import {Card,Collapse } from 'antd';


import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
import './css/display_patient.css'

class DisplayPatient extends Component {

    constructor(props){
        super(props); 

        this.addConsultation = this.addConsultation.bind(this);
        
    }

    state = {
        patient_name:"",
        patient_age:0,
        patient_files:[],
        filesInfo:[],
        showPopup:[],
        files:[],
        doctorConsultation:[],
        file: null
    }

    contract = this.props.contract;
    Acc= this.props.Acc;
    async loadFiles(){

        const data = await this.contract.methods.getPatientInfoForDoctor(this.props.patient_address).call({from:this.Acc[0]});
        console.log('files',data);
        if(data[3])
        this.setState({patient_name:data[0],patient_age:data[1],files:data[3]});

        console.log('files',this.state.files);
    }

    async loadDoctorConsultation(){
        const data = await this.contract.methods.getDoctorConsultation(this.props.patient_address).call({from:this.Acc[0]});
        
        if(data)
            this.setState({doctorConsultation:data});

        console.log('doctor consultation', this.state.doctorConsultation);
            
    }
    
    componentWillMount() {
        if(this.props.patient_address)
            this.loadFiles(this.props.patient_address);
            this.loadDoctorConsultation(this.props.patient_address);
            
    }
    

    async addConsultation(event){
        event.preventDefault();
        let consult = document.getElementById('consultation').value;
        let med = document.getElementById('medicine').value;
        let time_per = document.getElementById('time_period').value;
        let res = await this.contract.methods.addDoctorOfferedConsultation(this.props.patient_address,consult,med, time_per).send({"from":this.Acc[0]});

        console.log(res);
        if(res)
            console.log("consultation added");
        else
            console.log("consultation failed")
    }


    showFile(hash) {
        let { files } = this.state;
        if(files.indexOf(hash) > -1){
            let path=`https://ipfs.io/ipfs/${hash[2]}`
            console.log(path);
            window.open(path);
        }
    }

    
    
    

    render() {
        let { patient_address } = this.props;
        let { patient_name, patient_age, files,  doctorConsultation } = this.state;

        

        return(
            <div className='doctorbody' >
                
                <Card bordered={true} style={{width:'143%', border:'2px black solid'}}>
                    <h6>Patient address:</h6>  {patient_address} <br></br>
                    <h6>Patient name:</h6>  {patient_name} <br></br>
                    <h6>Patient age:</h6>  {patient_age}
                </Card>


                <div style={{display:'flex', justifyContent:'space-between', width:'142%'}}>
                    
                    <div style={{display:'flex', flexDirection:'column', width:'35%', border:'1px black solid'}}>
                        <h5>Patient Files</h5>
                        <div style={{height: "310px", overflowY: "auto",width:'100%',paddingRight:'15px'}}>
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                                    { 
                                        files.map((fhash, i) => {
                                            let filename = this.state.files[i]?this.state.files[i][0]:null;
                                            

                                            let diplayImage = `https://ipfs.io/ipfs/${this.state.files[i][2]}`;
                                            

                                            let fileProps = {fhash, filename, diplayImage, i};
                                            
                                            return <DisplayFiles props={fileProps} that={this} />
                                        }) 
                                    }
                            </Collapse>
                        </div>
                    </div>


                    <div style={{display:'flex', flexDirection:'column', width:'37%', border:'1px black solid'}}>
                        <h5>Doctor Consultation </h5>
                        <div style={{ overflowY: "auto",width:'100%', height:'310px'}}>
                        
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                                { 
                                            doctorConsultation.map((doc,i) => {
                                                let doctor_id = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][0]:null;
                                                let consultation_advice = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][1]:null;
                                                let medicine = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][2]:null;
                                                let time_period =this.state.doctorConsultation[i]?this.state.doctorConsultation[i][3]:null;
                                                
                                                let consultProps = {doctor_id,consultation_advice, medicine, time_period};

                                                return <DisplayConsultation that={this} props={consultProps} />
                                            })
                                }
                    
                            </Collapse>
                        </div>
                    </div>

                    <div style={{width:'34%', height:'auto',paddingLeft:'20px', border:'1px black solid'}}>
                        <h6>Add consultation</h6>
                        
                        <form onSubmit={this.addConsultation}>
                            <table>
                                
                                <tr>
                                    <td><input type='text' id='consultation' placeholder='consultation'/></td>
                                </tr>
                                
                                <tr>
                                    <td><input type="text" id='medicine' placeholder='medicine'/></td>
                                </tr>

                                <tr>
                                    <td><input type="text" id='time_period' placeholder='time period'/></td>
                                </tr>
                                <button className='button-12' type="submit" value="submit">submit</button>
                            </table>
                        </form>
                        
                    </div>
                </div>
            </div>


        );
    }
}




export default DisplayPatient;
