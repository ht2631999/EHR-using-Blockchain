import React, { Component } from 'react';

import {  Icon, Card,Collapse } from 'antd';


import PopUp from "./common/popup";
import DisplayFiles from "./common/display_file";
import ipfs from './ipfs-util';
import axios from "axios";
import { T } from 'antd/lib/upload/utils';
const Panel = Collapse.Panel;

class DisplayPatient extends Component {

    constructor(props){
        super(props); 
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
        doctorAddedFiles:[],
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

    async loadDoctorAddedFiles(){
        
        const data = await this.contract.methods.getDoctorAddedFiles(this.props.patient_address).call({from:this.Acc[0]});
        console.log('Doctor added files',data);
        if(data[3])
        this.setState({patient_name:data[0],patient_age:data[1], doctorAddedFiles: data[3]});

        console.log('doctor added files',this.state.doctorAddedFiles);
    }
    // getPatientInfoForDoctor = async (patient_address, callback) => {
        
    //     let res = await this.contract.methods.getUserFiles(patient_address).call({from :this.Acc[0]});
    //     callback(res);
    // } 
    
    //   getFileInfo (role, file_list, patient_address, callback) {
    //     // let res = await healthRecord.getFileInfoPatient.sendTransaction(fileHash, {"from":web3.eth.accounts[0]});
    //     let body = {role, file_list, address: this.Acc[0], patient_address};
    //     axios.post('/files_info',body)
    //     .then((response) => {
    //         if(response.data)
    //             callback(response.data);
    //         else
    //             callback([]);
    //     })}
    componentWillMount() {
        if(this.props.patient_address)
            this.loadFiles(this.props.patient_address);
            this.loadDoctorAddedFiles(this.props.patient_address);
            // this.getPatientInfoForDoctor(this.props.patient_address, (data) => {
            //     this.setState({patient_name:data[0],patient_age:data[1],patient_files:data[3]},
            //     () => {
            //         let  { patient_files } = this.state;
            //         this.getFileInfo("doctor", patient_files, this.props.patient_address, (filesInfo) => {
            //             this.setState({filesInfo});
            //         });
            //     });
            //});
    }
    // async getPatientInfoForDoctor() { {
    //     let data = await this.contract.methods.getPatientInfoForDoctor(this.props.patient_address).send({from:this.Acc[0]});
    //     this.setState({patient_name:data[0],patient_age:data[1],patient_files:data[3]},
    //     () => {
    //         let  { patient_files } = this.state;
            
    //         this.contract.methods.getFileInfo("doctor", patient_files, this.props.patient_address).then( (filesInfo) => {
    //             this.setState({filesInfo});
    //         });
    //     });
    // }
    // }


    updateFileHash = async (name,type,ipfshash) => {
        
        //sending transaction and storing result to state variables
       
         let res = await this.contract.methods.doctorAddConsultation(this.props.patient_address ,name,type,ipfshash).send({"from":this.Acc[0]});
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
        let { patient_name, patient_age, files, doctorAddedFiles } = this.state;
        //let { token } = this.props.auth;
        

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
                                    //let diplayImage = "/ipfs_file?hash="+fhash+"&file_name="+filename;
                                    let diplayImage = `https://ipfs.io/ipfs/${this.state.files[i][2]}`;
                                    // "&role=patient&token="+token+"&patient_address="+web3.eth.accounts[0];
                                    //let diplayImage=null;
                                    let fileProps = {fhash, filename, diplayImage, i};
                                    
                                    return <DisplayFiles that={this} props={fileProps}/>
                                }) 
                            }
                        </Panel>
                       
                    </Collapse>
                </div>
                <div style={{height: "500px", overflowY: "scroll"}}>
                    <h5>Doctor Consultation Files</h5>
                <Collapse className='folderTab' defaultActiveKey={['1']}>
                        <Panel   header={<Icon type="folder" />} key="2">
                            { 
                                files.map((fhash, i) => {
                                    let filename = this.state.files[i]?this.state.files[i][0]:null;
                                    //let diplayImage = "/ipfs_file?hash="+fhash+"&file_name="+filename;
                                    let diplayImage = `https://ipfs.io/ipfs/${this.state.files[i][2]}`;
                                    // "&role=patient&token="+token+"&patient_address="+web3.eth.accounts[0];
                                    //let diplayImage=null;
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
                            {/* <Input className='emailId' style={{width:"100%"}} value={this.state.secret} onChange={this.onTextChange.bind(this, 'secret')} size="small" placeholder="One Time Secret"/> */}
                            
                            <input type="file" onChange={this.getFile}></input>
                            <input type="submit"></input>
                            </form>
                    </Card>
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