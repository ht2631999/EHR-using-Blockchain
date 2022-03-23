import React, { Component, createElement } from 'react';

import {  Icon, Card,Collapse } from 'antd';


import PopUp from "./common/popup";
import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";

import ipfs from './ipfs-util';
import axios from "axios";
import { T } from 'antd/lib/upload/utils';
const Panel = Collapse.Panel;

var Web3 = require('web3');
class DisplayPatient extends Component {

    constructor(props){
        super(props); 

        // this.getFile = this.getFile.bind(this);
        // this.uploadFile = this.uploadFile.bind(this);
        this.addConsultation = this.addConsultation.bind(this);
        
    }

    state = {
        patient_name:"",
        patient_age:0,
        patient_files:[],
        filesInfo:[],
        showPopup:[],
        files:[],
        // doctorAddedFiles:[],
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
    // async loadDoctorAddedFiles(){
        
    //     const data = await this.contract.methods.getDoctorAddedFiles(this.props.patient_address).call({from:this.Acc[0]});
    //     console.log('Doctor added files',data);
    //     if(data[3])
    //     this.setState({doctorAddedFiles: data[3]});

    //     console.log('doctor added files',this.state.doctorAddedFiles);
    // }
    
    componentWillMount() {
        if(this.props.patient_address)
            this.loadFiles(this.props.patient_address);
            this.loadDoctorConsultation(this.props.patient_address);
            // this.loadDoctorAddedFiles(this.props.patient_address);
            
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

    // updateFileHash = async (name,type,ipfshash) => {
        
    //     //sending transaction and storing result to state variables
       
    //      let res = await this.contract.methods.doctorAddConsultation(this.props.patient_address ,name,type,ipfshash).send({"from":this.Acc[0]});
    //          console.log(res);
    //      if(res)
    //          console.log("file upload successful");
    //      else
    //          console.log("file upload unsuccessful");
         
         
    //  }

     
    // async uploadFile(event)
    // {
    //     event.preventDefault();

    //     ipfs.files.add(this.state.buffer,(err,res)=>{
    //         if(err){
    //             console.error(err)
    //             return 
    //         }
            
    //        this.updateFileHash(this.state.file.name,this.state.file.type,res[0].hash)
    //     })
    // }

    // getFile(event)
    // {
    //     event.preventDefault();
    //     console.log("getfile");
    //     const file = event.target.files[0];
    //     const reader = new window.FileReader();
    //     reader.readAsArrayBuffer(file);
    //     reader.onloadend =() =>{
    //         this.setState({buffer:Buffer(reader.result),file});
            
    //         console.log('buffer',file);
    //     }
    // }

    showFile(hash, flag) {
        let { files, showPopup } = this.state;
        if(files.indexOf(hash) > -1){
            let showPopupTemp = showPopup.slice(0);
            showPopupTemp[files.indexOf(hash)] = flag;
            this.setState({showPopup:showPopupTemp});
        }
    }

    
    
    

    render() {
        let { patient_address } = this.props;
        let { patient_name, patient_age, files, doctorAddedFiles, doctorConsultation } = this.state;

        

        return(
            <div style={{width:"100%"}}>
                
                <Card bordered={true} style={flexStyle}>
                    <h4><b>Patient address:</b> {patient_address}</h4>
                    <h4><b>Patient name:</b> {patient_name}</h4>
                    <h4><b>Patient age:</b> {patient_age}</h4>
                </Card>
                <div style={{height: "500px", overflowY: "scroll"}}>
                <Collapse className='folderTab' defaultActiveKey={['1']}>
                <h5>Patient Files</h5>
                        <Panel   header={<Icon type="folder" />} key="1">
                            { 
                                files.map((fhash, i) => {
                                    let filename = this.state.files[i]?this.state.files[i][0]:null;
                                    

                                    let diplayImage = `https://ipfs.io/ipfs/${this.state.files[i][2]}`;

                                    let fileProps = {fhash, filename, diplayImage, i};
                                    
                                    return <DisplayFiles that={this} props={fileProps}/>
                                }) 
                            }
                        </Panel>
                       
                    </Collapse>
                </div>


                {/* <div style={{height: "500px", overflowY: "scroll"}}>
                    <h5>Doctor Consultation Files</h5>
                <Collapse className='folderTab' defaultActiveKey={['1']}>
                        <Panel   header={<Icon type="folder" />} key="2">
                            { 
                                doctorAddedFiles.map((fhash, i) => {
                                    let filename = this.state.doctorAddedFiles[i]?this.state.doctorAddedFiles[i][0]:null;
                                    let filehash = this.state.doctorAddedFiles[i]?this.state.doctorAddedFiles[i][2]:null;
                                    let diplayImage = `https://ipfs.io/ipfs/${filehash}`;
                                    
                                    let fileProps = {fhash, filename, diplayImage, i};
                                    
                                    return <DisplayFiles that={this} props={fileProps}/>
                                }) 
                            }
                        </Panel>
                       
                    </Collapse>
                </div>

                <div>
                    <h5>Add Consultation</h5>
                    <Card bordered={true}>
                            <form onSubmit={this.uploadFile}>
                            
                            <input type="file" onChange={this.getFile}></input>
                            <input type="submit"></input>
                            </form>
                    </Card>
                </div> */}
                
                <div style={{height: "500px", overflowY: "scroll"}}>
                <Collapse className='folderTab' defaultActiveKey={['1']}>
                    <h5>Doctor Consultation </h5>
                    <Panel   header={<Icon type="folder" />} key="2">
                            { 
                                doctorConsultation.map((doc,i) => {
                                    let doctor_id = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][0]:null;
                                    let consultation_advice = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][1]:null;
                                    let medicine = this.state.doctorConsultation[i]?this.state.doctorConsultation[i][2]:null;
                                    let time_period =this.state.doctorConsultation[i]?this.state.doctorConsultation[i][3]:null;
                                    
                                    let consultProps = {doctor_id,consultation_advice, medicine, time_period};

                                    return <DisplayConsultation that={this} props={consultProps} />
                                    // //creating div
                                    // let new_div=document.createElement('div');
                                    
                                    // //adding doc id
                                    // let doc_id_head= document.createElement('h6');
                                    // doc_id_head.value= "Doctor ID";
                                    // new_div.appendChild(doc_id_head);

                                    // let doc_id_para=document.createElement('p');
                                    // doc_id_para.value=`${doctor_id}`;
                                    // new_div.appendChild(doc_id_para);

                                    // //adding consultation_advice
                                    // let consultation_head=document.createElement('h6');
                                    // consultation_head.value= "Consultation";
                                    // new_div.appendChild(consultation_head);

                                    // let consultation_para=document.createElement('p');
                                    // consultation_para.value=`${consultation_advice}`;
                                    // new_div.appendChild(consultation_para);

                                    // //adding medicine
                                    // let medicine_head=document.createElement('h6');
                                    // medicine_head.value= "Medicine";
                                    // new_div.appendChild(medicine_head);

                                    // let medicine_para=document.createElement('p');
                                    // medicine_para.value=`${medicine}`;
                                    // new_div.appendChild(medicine_para);

                                    // //adding medicine
                                    // let time_head=document.createElement('h6');
                                    // time_head.value= "Time";
                                    // new_div.appendChild(time_head);

                                    // let time_para=document.createElement('p');
                                    // time_para.value=`${time_period}`;
                                    // new_div.appendChild(time_para);

                                    // return new_div;
                                    
                                    // return (
                                    //     <div>
                                    //         <h6>Doctor ID</h6><br></br>
                                    //         <p id='doc_id'></p>
                                    //         <h6>Consultation</h6><br></br>
                                    //         <p id='consultations'></p>
                                    //         <h6>medicine</h6><br></br>
                                    //         <p id='medicines'></p>
                                    //         <h6>Time period</h6><br></br>
                                    //         <p id='time'></p>
                                    //         {/* <script>
                                    //             document.getElementById('doc_id').innerHTML= `${doctor_id}`;
                                    //             document.getElementById('consultations').innerHTML= `${consultation_advice}`;
                                    //             document.getElementById('medicines').innerHTML= `${medicine}`;
                                    //             document.getElementById('time').innerHTML= `${time_period}`;  
                                    //         </script> */}
                                            
                                    //     </div>
                                    // )
                                })
                            }
                        </Panel><Card bordered={true}>

                    </Card>
                    </Collapse>
                </div>

                <div>
                    <form onSubmit={this.addConsultation}>
                            <label>Add consultation
                                <input type='text' id='consultation'/>
                            </label>
                            
                            <label> Add medicine
                            <input type="text" id='medicine'/>
                            </label>
                            
                            <label> Time period
                                <input type="text" id='time_period'/>
                            </label>
                            <input type="submit" value="submit"/>
                    </form>
                </div>
            </div>


        );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}


//export default DisplayPatient;
const mapStateToProps = (state) => {
    return {
      global_vars: state.global_vars,
      auth: state.auth
    };
};

export default DisplayPatient;
//export default connect(mapStateToProps, {})(DisplayPatient);