import React, { Component, } from 'react';

import {Card,Collapse } from 'antd';
import ipfs from './ipfs-util'
import healthRecord from "../contracts/DoctorAddRecord.json"
import getWeb3 from '../getWeb3';
import DisplayFiles from "./common/display_file";
import DisplayConsultation from "./common/displayConsultation";
// import DisplayPayment from './common/displayPayment';
import './css/display_patient.css'

class DisplayPatient extends Component {

    constructor(props){
        super(props); 

        this.addConsultation = this.addConsultation.bind(this);
        this.getFile = this.getFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        
    }

    state = {
        patient_name:"",
        patient_age:0,
        patient_files:[],
        filesInfo:[],
        showPopup:[],
        files:[],
        doctorConsultation:[],
        doctorAddedFiles:[],
        doctorPassbook: [],
        doctorBalance:0,
        file: null
    }

   
    contract = this.props.contract[0];
    doctorAddRecord = this.props.contract[1];

    Acc= this.props.Acc;

    async loadcontract(){
        var web3 = await getWeb3();
        const networkId = await web3.eth.net.getId();
        var deployedNetwork = healthRecord.networks[networkId];

        this.doctorAddRecord = new web3.eth.Contract(
            healthRecord.abi,
            deployedNetwork && deployedNetwork.address,
          );
    }
    async loadFiles(){

        const data = await this.contract.methods.getPatientInfoForDoctor(this.props.patient_address).call({from:this.Acc[0]});
        console.log('files',data);
        if(data[3])
        this.setState({patient_name:data[0],patient_age:data[1],files:data[3]});

        console.log('files',this.state.files);
    }

    async loadDoctorConsultation(){
        const data = await this.doctorAddRecord.methods.getDoctorConsultation(this.props.patient_address).call({from:this.Acc[0]});
        
        if(data)
            this.setState({doctorConsultation:data});

        console.log('doctor consultation', this.state.doctorConsultation);
            
    }

    async loadDoctorAddedFiles(){
        try{
        const data = await this.doctorAddRecord.methods.getDoctorAddedFiles(this.props.patient_address).call({from:this.Acc[0]});
        if(data)
        this.setState({doctorAddedFiles: data});

        console.log('doctor added files',this.state.doctorAddedFiles);
        }
        catch(e){
            console.log(e);
        }
    }

    // async loadDoctorWallet(){
    //     try{
    //         const data = await this.contract.methods.getReceivedPayments().call({from:this.Acc[0]});
    //         if(data)
    //             this.setState({doctorPassbook: data[0], doctorBalance: data[1]});
            
    //         console.log(this.state.doctorPassbook);
    //         console.log(this.state.doctorBalance);
    //     }

    //     catch(e){
    //         console.log(e);
    //     }
    // }
    
    componentWillMount() {
        
        if(this.props.patient_address)
            this.loadFiles(this.props.patient_address);
            this.loadDoctorConsultation(this.props.patient_address);
            //uncomment after uncommenting from smart contract and after successful migration
            this.loadDoctorAddedFiles(this.props.patient_address)
            // console.log(this.doctorAddRecord)
            // this.loadDoctorWallet();
            
    }


    

    async addConsultation(event){
        event.preventDefault();
        let consult = document.getElementById('consultation').value;
        let med = document.getElementById('medicine').value;
        let time_per = document.getElementById('time_period').value;
        let res = await this.doctorAddRecord.methods.addDoctorOfferedConsultation(this.props.patient_address,consult,med, time_per).send({"from":this.Acc[0]});

        console.log(res);
        if(res)
            console.log("consultation added");
        else
            console.log("consultation failed")
    }

    updateFileHash = async (name,type,ipfshash) => {

        //sending transaction and storing result to state variables
        try{
         let res = await this.doctorAddRecord.methods.doctorAddFiles(this.props.patient_address ,name,type,ipfshash).send({"from":this.Acc[0]});
             console.log(res);
         if(res)
             console.log("file upload successful");
         else
             console.log("file upload unsuccessful");
        }
        catch(e){
            console.log(e);
        }
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
        let { files,doctorAddedFiles } = this.state;
        if(files.indexOf(hash) > -1 || doctorAddedFiles.indexOf(hash)>-1){
            let path=`https://ipfs.io/ipfs/${hash[2]}`
            console.log(path);
            window.open(path);
        }
    }

    
    
    

    render() {
        let { patient_address } = this.props;
        // let { patient_name, patient_age, files, doctorAddedFiles, doctorConsultation, doctorPassbook } = this.state;
        let { patient_name, patient_age, files, doctorAddedFiles, doctorConsultation } = this.state;

        

        return(
            <div className='container-fluid' >
                
                <div className='row'>
                <Card bordered={true} style={{width:'143%', border:'2px black solid'}}>
                    <h6>Patient Id:</h6>  {patient_address} <br></br>
                    <h6>Patient name:</h6>  {patient_name} <br></br>
                    <h6>Patient age:</h6>  {patient_age}
                </Card>
                </div>

                <div className='row mt-3'>
                    
                    <div className='col-4 mt-2' style={{border:'3px solid black'}}>
                        <h5>Patient Files</h5>
                        <div style={{height: "310px", overflowY: "auto",width:'100%',paddingRight:'15px'}}>
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                                    { 
                                        files.map((fhash, i) => {                                            

                                            return <DisplayFiles props={fhash} that={this} />
                                        }) 
                                    }
                            </Collapse>
                        </div>
                    </div>


                    <div className='col-4 mt-2' style={{border:'3px solid black'}}>
                        <h5>Doctor Consultations </h5>
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

                    <div className='col-4 mt-2' style={{border:'3px solid black'}}>
                        <h5>Doctor Added Files</h5>
                        <div style={{height: "310px", overflowY: "auto",width:'100%',paddingRight:'15px'}}>
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                                    { 
                                        doctorAddedFiles.map((fhash, i) => {
                                            
                                            return <DisplayFiles props={fhash} that={this} />
                                        }) 
                                    }
                            </Collapse>
                        </div>
                    </div>
                </div>
                
                <div className='row mt-3'>
                    
                    
                    <div className='col-6 mt-3' style={{border:'3px solid black'}}>
                            <h6>Add consultation</h6>
                            <div>
                            <form onSubmit={this.addConsultation}>
                                <table>
                                    
                                    <tr>
                                        <td><input type='text' id='consultation' placeholder='consultation'/></td>
                                    </tr>
                                    
                                    <tr>
                                        <td><input type="text" id='medicine' placeholder='medicine / Reports'/></td>
                                    </tr>

                                    <tr>
                                        <td><input type="text" id='time_period' placeholder='time period / NA'/></td>
                                    </tr>
                                    <button className='button-12' type="submit" value="submit">submit</button>
                                </table>
                            </form>
                            </div>
                        </div>
                    
                    <div className='col-6 mt-3' style={{border:'3px solid black'}}>
                        <h5>Upload File/Report</h5>
                        <div>
                        <Card bordered={true}>
                                <form onSubmit={this.uploadFile}>
                                <input type="file" onChange={this.getFile}></input>
                                <input type="submit"></input>
                                </form>
                        </Card>
                        </div>
                    </div>
                </div>
                {/* <div>
                    <h6>Doctor Balance = {this.state.doctorBalance}</h6>
                    <div style={{ overflowY: "auto",width:'100%', height:'310px'}}>
                        
                            <Collapse className='folderTab' defaultActiveKey={['1']}>
                                { 
                                    doctorPassbook.map((doc,i) => {
                                        let to = this.state.doctorPassbook[i]?this.state.doctorPassbook[i][0]:null;
                                        let from = this.state.doctorPassbook[i]?this.state.doctorPassbook[i][1]:null;
                                        let amount = this.state.doctorPassbook[i]?this.state.doctorPassbook[i][2]:null;
                                        let context =this.state.doctorPassbook[i]?this.state.doctorPassbook[i][3]:null;
                                        let isDoctor = true;
                                        let paymentProps = {to, from, amount, context, isDoctor};

                                        return <DisplayPayment that={this} props={paymentProps} />
                                    })
                                }
                    
                            </Collapse>
                        </div>
                </div> */}
            </div>


        );
    }
}




export default DisplayPatient;
