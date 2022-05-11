import React, { Component } from 'react';
import {   Input,  message, Tag, Card, Collapse } from 'antd';
import healthRecord from "../contracts/DoctorAddRecord.json"
import getWeb3 from '../getWeb3';
import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
import './css/patient.css'

import ipfs from "./ipfs-util"


class Patient extends Component {

    constructor(props){
        super(props);
        this.uploadFile = this.uploadFile.bind(this);
        this.getFile = this.getFile.bind(this);
        // this.addPatientToInsuranceComp = this.addPatientToInsuranceComp.bind(this);

    }

    contract =this.props.contract['OPT'];
    doctorAddRecord = this.props.contract['DAR'];
    accounts =this.props.Acc;

    state = {
        name: "",
        DOB: "",
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
        doctorAddedFiles:[],
        contact_info:"",
        file:null
    }


    async loadcontract(){
        var web3 = await getWeb3();
        const networkId = await web3.eth.net.getId();
        var deployedNetwork = healthRecord.networks[networkId];

        this.doctorAddRecord = new web3.eth.Contract(
            healthRecord.abi,
            deployedNetwork && deployedNetwork.address,
          );

          console.log("contract loaded")
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

        this.setState({name:res[0],DOB:res[2],files:res[3],doctor_list:res[4], contact_info:res[6]},
        () => {
            this.loadFiles();
            this.loadcontract();
            this.loadDoctorAddedFiles();
            this.loadDoctorConsultation();
            
        
        });
      
    }

    async loadDoctorConsultation(){
        const data = await this.doctorAddRecord.methods.getDoctorConsultationForPatient().call({from:this.accounts[0]});
        
        if(data)
            this.setState({doctorConsultation:data});

        console.log('doctor consultation', this.state.doctorConsultation);
            
    }

    async loadDoctorAddedFiles(){
        try{
        const data = await this.doctorAddRecord.methods.getDoctorAddedFiles(this.accounts[0]).call({from:this.accounts[0]});
        if(data)
        this.setState({doctorAddedFiles: data});

        console.log('doctor added files',this.state.doctorAddedFiles);
        }
        catch(e){
            console.log(e);
        }
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

    
    updateFileHash = async (name,type,ipfshash) => {
        
        //sending transaction and storing result to state variables
          
         let res = await this.contract.methods.addUserFiles(name,type,ipfshash).send({"from":this.accounts[0]});
             console.log(res);
         if(res)
             console.log("file upload successful");
         else
             console.log("file upload unsuccessful");
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
        let { files, doctorAddedFiles} = this.state;
        if(files.indexOf(hash) > -1 || doctorAddedFiles.indexOf(hash)>-1){
            let path=`https://ipfs.io/ipfs/${hash[2]}`
            console.log(path);
            window.open(path);
        }
    }

    
    // async addPatientToInsuranceComp(event){
    //     event.preventDefault();
    //     let addr1= document.getElementById('added_patient').value;
    //     let addr2= document.getElementById('added_to_company').value;
    //     try{
    //         let result = await this.contract.methods.addPatientToInsuranceComp(addr2,addr1).send({"from":this.accounts[0]});
    //         console.log(result);
    //     }
    //     catch(e){
    //         console.log(e);
    //     }
    // }

    render() {
        let { name, DOB, files, doctor_list, doctorConsultation, doctorAddedFiles, contact_info } = this.state;
        
        return (
            <div className='container' >
                <div className='mt-3' style={{border: '1px solid black'}}>
                    
                        <Card bordered={true} >
                            <div className='userDetails'  >
                                    <h4>Patient Details</h4>
                                    <span> <b>Name:</b> {name} </span> 
                                    <br></br>
                                    <span> <b>DOB:</b> {DOB}</span>
                                    <br></br>
                                    <span> <b>Contact Info:</b> {contact_info}</span>
                            </div>
                        </Card>
    
                </div>

                <div className='row mt-3' style={{paddingTop:'25px'}}>    
                    <div className='col mt-2' style={{border: '1px solid black'}}>
                    <h6>Grant Access</h6>
                        <Card bordered={true}>
                            <div style={flexStyle}>
                            <Input className='emailId' value={this.state.doctorId} onChange={this.onTextChange.bind(this, 'doctorId')} size="small" placeholder="Grant Address"/>
                                <button className='button-12' type="primary" onClick={this.grantAccess.bind(this)} htmlType="submit" >
                                    Grant Access
                                </button>
                            </div>
                        </Card>
                    </div>

                    <div className='col mt-2' style={{border: '1px solid black'}}>
                        <h6>Revoke Access</h6>
                        <Card bordered={true}>
                            <div style={flexStyle}>
                            <Input className='emailId' value={this.state.doctorId} onChange={this.onTextChange.bind(this, 'doctorId')} size="small" placeholder="Revoke Address"/>
                                
                                <button className="button-12" type="primary" onClick={this.revokeAccess.bind(this)} htmlType="submit" >
                                    Revoke Access
                                </button>
                            </div>
                        </Card>
                    </div>
                    
                </div>
                
                <div className='row mt-3' style={{paddingTop:'25px'}}>

                    <div className='col-6 mt-2' style={{height: "310px",border: '1px solid black'}}>
                    <h6>Upload File</h6>
                        <Card bordered={true}>
                            <form onSubmit={this.uploadFile.bind(this)}>
                            {/* accept only .pdf and images as ipfs stores images, pdfs, videos*/}
                            <input type="file" accept='application/pdf, image/*' onChange={this.getFile.bind(this)}></input>
                            <input type="submit"></input>
                            </form>
                        </Card>
                    </div>

                    <div className='col-6 mt-2' style={{height: "310px", width:'25%', overflow:'auto',border: '1px solid black'}}>
                        <Collapse className='folderTab' defaultActiveKey={['1']}>
                        <h6>Your Files</h6>
                            { 
                                files.map((fhash, i) => {
                                    
                                    return <DisplayFiles that={this} props={fhash}/>
                                }) 
                            }
                        </Collapse>
                    </div>
                
                </div>

                <div className='row mt-3' style={{paddingTop:'25px'}}>
                    <div className='col mt-2' style={{height: "310px",overflow:'scroll',border: '1px solid black'}}>
                        <Collapse>
                            <h6 style={{align:'centre'}}>Doctor List</h6>
                                { 
                                    doctor_list.map((doctor) => {
                                        return <Tag>{doctor} <br></br></Tag>
                                    }) 
                                }
                        </Collapse>
                    </div>
                    <div className='col mt-2' style={{height: "310px", overflow:'auto',border: '1px solid black'}}>
                    <Collapse className='folderTab' defaultActiveKey={['1']}>
                        <h6>Doctor Consultations </h6>
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

                    <div className='col mt-2' style={{height: "310px", overflow:'auto',border: '1px solid black'}}>
                        
                        <Collapse className='folderTab' defaultActiveKey={['1']}>
                        <h6>Doctor Added Files</h6>
                                { 
                                    doctorAddedFiles.map((fhash, i) => {
                                        
                                        return <DisplayFiles props={fhash} that={this} />
                                    }) 
                                }
                        </Collapse>
                    </div> 
                </div>  
{/*                 
                <div className='row mt-2'>
                    <div className='col mt-2' style={{border: '1px solid black'}}>
                        <h4 style={{align:'centre'}}>Register To Insurance Comp.</h4>
                        <div>
                            <form onSubmit={this.addPatientToInsuranceComp}>
                                <div className='label mt-2'>Patient Address:</div>
                                <input type="text" id="added_patient" placeholder='Patient address'></input>
                                <br></br>
                                <div className='label mt-2'>Company Address:</div>
                                <input type="text" id="added_to_company" placeholder='Company Address'></input>
                                <br></br>
                                <Button variant="dark" className="button" type="submit">Add</Button>
                            </form>
                        </div>
                    </div>
                </div> */}
            </div>
                

        );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}


export default Patient;

