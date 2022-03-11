import React, { Component } from 'react';
import { getPatientInfoForDoctor } from './eth-util';
import { getFileInfo } from "./eth-util";
import {  Icon, Card,Collapse } from 'antd';


import PopUp from "./common/popup";
import DisplayFiles from "./common/display_file";

import axios from "axios";
const Panel = Collapse.Panel;

class DisplayPatient extends Component {

    constructor(props){
        super(props);
    }

    state = {
        patient_name:"",
        patient_age:0,
        patient_files:[],
        filesInfo:[],
        showPopup:[],
        files:[]
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
        let { patient_name, patient_age, files } = this.state;
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