import React, { Component } from 'react';
import {  Button, Card,Icon} from 'antd';
import PopUp from "./popup";

class display_file extends Component{ 
    render(){

    let {fhash, filename, diplayImage, i} = this.props.props;
    let that =this.props.that;
    return(
        <div>
            <Card title={filename} bordered={true}>
                <h4>filehash: {fhash}</h4>
                <h4>filetype: {that.state.filesInfo[i]?that.state.filesInfo[i][1]:null}</h4>
                <Button type="primary" onClick={that.showFile.bind(that, fhash, true)}><Icon type="file" />Show File</Button>
                <PopUp showPopup={that.state.showPopup[i]} closePopup={that.showFile.bind(that, fhash, false)}>
                    Downloading File
                    <img src={diplayImage} />
                </PopUp>
            </Card>
        </div>
    );
    }
}

const flexStyle = {
    display:"flex", 
    flexDirection:"column"
}

export default display_file;