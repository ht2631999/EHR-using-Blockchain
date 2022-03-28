import React, { Component } from 'react';
import { Card,Icon} from 'antd';
import PopUp from "./popup";
import {Redirect} from 'react-router-dom'

import '../css/display_file.css'
class display_file extends Component{ 

    render(){

    let {fhash, filename, diplayImage, i} = this.props.props;
    let that =this.props.that;
    return(
        <div>
            <Card title={filename} bordered={true}>
                <button className='button-81' type="primary" onClick={that.showFile.bind(that, fhash, true)}><Icon type="file" />Show File</button>
                <PopUp showPopup={that.state.showPopup[i]} closePopup={that.showFile.bind(that, fhash, false)}>
                    Downloading File
                    <img src={diplayImage} alt='Patient file'/>
                </PopUp>
            </Card>
        </div>
    );
    }
}


export default display_file;