import React, { Component } from "react";
import {Button} from 'react-bootstrap';
import "./css/DocLogin.css";
 
class DocLogin extends Component{
  state={textvalue:"",formNum:false,age:0};
  cont = this.props.state.contract;
  Acc = this.props.state.accounts;
  
 
  async registerDoc(event)
  {
      event.preventDefault(true);
      let name=document.getElementById('doc_name').value;
      let address = document.getElementById('doc_address').value;
      let contact_info= document.getElementById('doc_contact').value;
      let specialization = document.getElementById('doc_specs').value;
      
      console.log(name);
      console.log(address);
      console.log(contact_info);
      console.log(specialization);

      await this.cont['OPT'].methods.signupDoctor(name, address, contact_info, specialization).send({from :this.Acc[0]});
      
  }

  async checkDoc(event)
  {
    event.preventDefault(true);
    var result=null
    try{
      result = await this.cont['OPT'].methods.getDoctorInfo().call({from :this.Acc[0]});
      console.log(result);
      this.props.onlogin(result[1],0);
    }
    catch(err)
    {
        alert('Account Does Not Exist. Kindly Register');
    }

  }

  
  async registerPat(event)
  {
      event.preventDefault(true);
      let name = document.getElementById('patient_name').value;
      let age = document.getElementById('patient_age').value;
      let gender = document.getElementById('patient_gender').value;
      let contact_info = document.getElementById('patient_cont').value;
      await this.cont['OPT'].methods.signupPatient(name, age, contact_info, gender).send({from :this.Acc[0]});
      console.log(name);
      console.log(age);
      console.log(gender);
      console.log(contact_info); 
  }


  async checkPat(event)
  {
    event.preventDefault(true);
    
    var result =null;
    try{
    result = await this.cont['OPT'].methods.getPatientInfo().call({from :this.Acc[0]});
    console.log(result);
    this.props.onlogin(result[1],1);

    }
    catch(err)
    {
      alert('Account Does Not Exist. Kindly Register');
    }

  }

  async checkHospital(event){
    event.preventDefault();
    var result =null;

    try{
      result = await this.cont['OPT'].methods.getHospitalInfo().call({from :this.Acc[0]});
      console.log(result);
      this.props.onlogin(result[1],2);
  
      }
      catch(err)
      {
        alert('Owner has not created your hospital account');
      }
  
    console.log("Hospital check");
  }

  async checkOwner(event){
    event.preventDefault();
    var result =null;

    try{
      result = await this.cont['OPT'].methods.getOwnerInfo().call({from :this.Acc[0]});
      console.log(result);
      this.props.onlogin(result[1],3);
  
      }
      catch(err)
      {
        alert('You are not the owner');
      }
    console.log("Owner check");
  }

  render()
  {
    this.registerDoc = this.registerDoc.bind(this);
    this.checkDoc = this.checkDoc.bind(this);
    this.registerPat = this.registerPat.bind(this);
    this.checkPat = this.checkPat.bind(this);
    this.checkHospital = this.checkHospital.bind(this);
    this.checkOwner = this.checkOwner.bind(this);

    const ownerForm =
    <div className="container">
      <h5 style={{align:'centre'}}>Owner</h5>

      <div style={{marginLeft:'20px'}}>
        <form>
          
          <br></br>
          <Button variant="dark"  className="button" onClick={this.checkOwner}>Login By Address</Button>
        </form>
      </div>
    </div>;

    const hospitalForm =
    <div className="container">
      <h5 style={{align:'centre'}}>Hospital</h5>

      <div style={{marginLeft:'20px'}}>
        <form>
          
          <br></br>
          <Button variant="dark"  className="button" onClick={this.checkHospital}>Login By Address</Button>
        </form>
      </div>
    </div>;

    const docForm = 
    <div className="container">
      <h5 style={{align:'centre'}}>Doctor</h5>

      <div style={{marginLeft:'20px'}}>
        <form onSubmit={this.registerDoc}>
          <div className="label mt-2"><b>Name:</b></div>
          <input type="text" name="name" id="doc_name" placeholder="Name"></input>
          

          <br></br>

          <div className="label mt-2"><b>Address:</b></div>
          <input type="text" name="name" id="doc_address" placeholder="Address"></input>
        

          <br></br>
          <div className="label mt-2"><b>Contact Info:</b></div>
          <input type="text" name="name" id="doc_contact" placeholder="Contact Info"></input>
        
          
          <br></br>
          
          <div className="label mt-2"><b>Specialization:</b></div>
          <input type="text" name="name" id="doc_specs" placeholder="Specialization"></input>

          <br></br>
          <Button variant="dark" className="button" type="submit">Register Doctor</Button>
          <Button variant="dark"  className="button" onClick={this.checkDoc}>Login By Address</Button>
        </form>
      </div>
    </div>;

    const patForm=
      <div>
        <div><h5 style={{align:'centre'}}>Patient</h5></div>
      <div>
      <form onSubmit={this.registerPat}>
        

          
          <div className="label mt-2"><b>Enter Name</b></div>
          
          <input type="text" name="name" id="patient_name" placeholder="Name"/>

          <br></br>
          
          <div className="label mt-2"><b>Age</b></div>
          
          <input type="text" name="age" id="patient_age" placeholder="Age"></input>
          <br></br>

          <div className="label mt-2"><b>Address</b></div>
          
          <input type="text" name="address" id="patient_address" placeholder="Address"></input>
          <br></br>

          <div className="label mt-2"><b>Gender</b></div>
          
          <select id="patient_gender" name="gender">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
            <option value="Others">Others</option>
          </select>
          <br></br>

          <div className="label mt-2"><b>Contact Info</b></div>
          
          <input type="text" name="contact info" id="patient_cont" placeholder="Contact Info"></input>
          <br></br>


          <Button className="button" variant="dark" type="submit">Register Patient</Button>
          <Button className="button" variant="dark"  onClick={this.checkPat.bind(this)}>Login By Address</Button>
      
      </form>
      </div>
      </div>;


    const fNum = this.state.formNum;

    let loadForm;
    if(fNum == 0)
      loadForm = patForm;
    else if(fNum==1)
      loadForm = docForm;
    else if(fNum==2)
      loadForm = hospitalForm;
    else if(fNum==3)
      loadForm = ownerForm;
      


    return(
        
      <div className="dlbody" >
        
        <div className="alterBut">
          <Button className="dbutton" variant="primary" value="0" onClick={(event)=>this.setState({formNum:1})}>Doctor</Button>
        
          <Button className="pbutton" variant="success"  value="1" onClick={(event)=>this.setState({formNum:0})}>Patient</Button>

          <Button className="pbutton" variant="success"  value="1" onClick={(event)=>this.setState({formNum:2})}>Hospital</Button>

          <Button className="pbutton" variant="success"  value="1" onClick={(event)=>this.setState({formNum:3})}>Owner</Button>
        
          </div>

          <fieldset>
            
            {loadForm}
          </fieldset>

          </div>
        );
  }
}


export default DocLogin;