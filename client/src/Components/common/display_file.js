import React, { Component } from 'react';
import { Card,Icon} from 'antd';

import '../css/display_file.css'
class display_file extends Component{ 

    render(){

    let fhash = this.props.props;
    let that =this.props.that;
    return(
        <div>
            <Card title={fhash[0]} bordered={true}>
                <button className='button-81' type="primary" onClick={that.showFile.bind(that, fhash, true)}><Icon type="file" />Show File</button>
            </Card>
        </div>
    );
    }
}


export default display_file;