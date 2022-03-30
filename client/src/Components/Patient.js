import React, { Component } from 'react';
import {   Input,  message, Tag, Card, Collapse } from 'antd';

import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
import './css/patient.css'

import ipfs from "./ipfs-util"


class Patient extends Component {

    constructor(props){
        super(props);
        this.uploadFile = this.uploadFile.bind(this);
        this.getFile = this.getFile.bind(this);
    }

    contract =this.props.contract['OPT'];
    accounts =this.props.Acc;

    state = {
        name: "",
        age: 0,
        files: [],
        doctor_list: [],
        filesInfo:[],
        showPopup:[],
        doctorId: null,
        secret: null,
        visible: false,
        loaded:false,
        buffer:null,
        doctorConsultation:[],
        
        file:null
    }
     updateFileHash = async (name,type,ipfshash) => {
        
       //sending transaction and storing result to state variables
	     
        let res = await this.contract.methods.addUserFiles(name,type,ipfshash).send({"from":this.accounts[0]});
            console.log(res);
        if(res)
            console.log("file upload successful");
        else
            console.log("file upload unsuccessful");
        
        
    }
    
      
    componentDidMount(){ 
        
        this.loadPatient();     
    }


    async loadFiles(){
        const files = await this.contract.methods.getUserFiles(this.accounts[0]).call({from:this.accounts[0]});
        console.log('files',files);
        if(files[0])
        this.setState({files:files});

    }
    async loadPatient (){
        let res = await this.contract.methods.getPatientInfo().call({from :this.accounts[0]});

        this.setState({name:res[0],age:res[2],files:res[3],doctor_list:res[4]},
        () => {
            this.loadFiles();
            this.loadDoctorConsultation();
        
        });
      
    }

    async loadDoctorConsultation(){
        const data = await this.contract.methods.getDoctorConsultationForPatient().call({from:this.accounts[0]});
        
        if(data)
            this.setState({doctorConsultation:data});

        console.log('doctor consultation', this.state.doctorConsultation);
            
    }

    async grantAccess(){
        
        
        if(this.state.doctorId){
            let res = await this.contract.methods.grantAccessToDoctor(this.state.doctorId)
            .send({"from":this.accounts[0]});
            
            if(res) {
                message.success('access successful');
                console.log("access successful")
                this.setState({doctorId:null});
            }
        }
    }

    
    async revokeAccess(){
        
        
        if(this.state.doctorId){
            let res = await this.contract.methods.revokeAccessFromDoctor(this.state.doctorId)
            .send({"from":this.accounts[0]});
            
            if(res) {
                message.success('access revoked');
                console.log("access revoked")
                this.setState({doctorId:null});
            }
        }
    }

    onTextChange(type, e){
        if(e && e.target)
            this.setState({[type]:e.target.value});
    }

  
    async uploadFile(event)
    {
        event.preventDefault();

        ipfs.files.add(this.state.buffer,(err,res)=>{
            if(err){
                console.error(err)
                return 
            }
            
           this.updateFileHash(this.state.file.name,this.state.file.type,res[0].hash)
        })
    }
    getFile(event)
    {
        event.preventDefault();
        console.log("getfile");
        const file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend =() =>{
            this.setState({buffer:Buffer(reader.result),file});
            
            console.log('buffer',file);
        }
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
        let { name, age, files, doctor_list, doctorConsultation } = this.state;
        
        return (
            <div className='pbody' >
                <div style={{display: 'flex', flexDirection: 'row', justifyContent:'space-around'}}>
                    <div className='divborder' style={{width:'30%'}}>
                        <div>
                            <Card bordered={true} >
                                <div className='userDetails'  >
                                        <h4>Patient Details</h4>
                                        <span> <b>Name:</b> {name} </span> 
                                        <br></br>
                                        <span> <b>Age:</b> {age}</span>
                                    
                                </div>
                            </Card>
                        </div>
                        
                        <div>
                        <h6>Grant Access</h6>
                            <Card bordered={true}>
                                <div style={flexStyle}>
                                <Input className='emailId' style={{width:"100%"}} value={this.state.doctorId} onChange={this.onTextChange.bind(this, 'doctorId')} size="small" placeholder="Grant Address"/>
                                    <button className='button-12' type="primary" onClick={this.grantAccess.bind(this)} htmlType="submit" >
                                        Grant Access
                                    </button>
                                </div>
                            </Card>
                        </div>

                        <div>
                            <h6>Revoke Access</h6>
                            <Card bordered={true}>
                                <div style={flexStyle}>
                                <Input className='emailId' style={{width:"100%"}} value={this.state.doctorId} onChange={this.onTextChange.bind(this, 'doctorId')} size="small" placeholder="Revoke Address"/>
                                    
                                    <button className="button-12" type="primary" onClick={this.revokeAccess.bind(this)} htmlType="submit" >
                                        Revoke Access
                                    </button>
                                </div>
                            </Card>
                        </div>
                        <div>
                        <h6>Upload File</h6>
                            <Card bordered={true}>
                                <form onSubmit={this.uploadFile.bind(this)}>
                                {/* accept only .pdf and images as ipfs stores images, pdfs, videos*/}
                                <input type="file" accept='application/pdf, image/*' onChange={this.getFile.bind(this)}></input>
                                <input type="submit"></input>
                                </form>
                            </Card>
                        </div>
                    </div>

                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
                        <div style={{height: "310px", width:'20%', overflow:'auto'}}>
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                            <h6>Your Files</h6>
                            {/* <Panel   header={<Icon type="folder" />} key="1"> */}
                                { 
                                    files.map((fhash, i) => {
                                        let filename = this.state.files[i]?this.state.files[i][0]:null;
                                        
                                        let diplayImage = `https://ipfs.io/ipfs/${this.state.files[i][2]}`;
                                        let fileProps = {fhash, filename, diplayImage, i};
                                        
                                        return <DisplayFiles that={this} props={fileProps}/>
                                    }) 
                                }
                            {/* </Panel> */}
                            </Collapse>
                        </div>
                        <div style={{height: "310px", width:'35%',overflow:'auto'}}>
                            <Collapse>
                                <h6 style={{align:'centre'}}>Doctor List</h6>
                                {/* <Panel key="2"> */}
                                    { 
                                        doctor_list.map((doctor) => {
                                            return <Tag>{doctor}</Tag>
                                        }) 
                                    }
                                {/* </Panel> */}
                            </Collapse>
                        </div>
                    

                        <div style={{height: "310px", overflow:'auto', width:'40%'}}>
                        <Collapse className='folderTab' defaultActiveKey={['1']}>
                            <h6>Doctor Consultation </h6>
                            {/* <Panel   header={<Icon type="folder" />} key="2"> */}
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
                                {/* </Panel> */}
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}


export default Patient;

