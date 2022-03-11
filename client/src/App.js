//Main Execution will start from this file.
//Fistly all components will get mounted by componentsDidMount method and then render method will be called

import React, { Component } from "react";
import optHealthCare from "./contracts/optimized_healthCare.json"
import getWeb3 from "./getWeb3";
import DocLogin from "./Components/DocLogin";
import Doctor from "./Components/Doctor";
import Patient from "./Components/Patient";
import NavbarComp from "./Components/NavbarComp";

import "./App.css";
import "./Components/css/antd.css"
import 'antd/dist/antd.css';

class App extends Component {
  state = {  web3: null, accounts: null, contract: [],loggedAcc:null,loggedas:null};
  componentDidMount = async () => {
    try {
    
      var web3 = await getWeb3();
      var tmpcont=[];
      var accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      var deployedNetwork = optHealthCare.networks[networkId];

       tmpcont['OPT'] = new web3.eth.Contract(
        optHealthCare.abi,
        deployedNetwork && deployedNetwork.address,
      );

     //set State variables to derived values.
      this.setState({ web3, accounts, contract:tmpcont});

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    console.log(this.state.accounts);  // Reflect values on console
  };
  handleChange(event){
      this.setState({newValue: event.target.value});
  }
 
  render() {
    console.log(this.state.loggedas);   //uncomment to check if components are loaded
    
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    //Html template will call register page or if already regestered login page will be open
    //DocLogin file will be intiated
    return (
      <div className="App">
        
        <NavbarComp isLogged={this.state.loggedAcc} onlogout={()=>this.setState({loggedAcc:null,loggedas:null})}/>
         
        {/* <h1>Good to Go!</h1> */}
        {/* <p>Your Truffle Box is installed and ready.</p> */}
        
        {/* <form onSubmit={this.handleSubmit}>
          <div>
              Value of Variable is {this.state.newValue}  
          </div>  
          <input type="text" value={this.state.newValue} onChange={this.handleChange.bind(this)}></input>
          <input type="submit" value="Submit"/>
          
          </form> */}
          
          {!this.state.loggedAcc ? <DocLogin onlogin={(loggedAcc,loggedas)=>this.setState({loggedAcc,loggedas})} state = {this.state}/>
               :this.state.loggedas===0?<Doctor contract={this.state.contract} Acc={this.state.accounts}/>:<Patient contract={this.state.contract} Acc={this.state.accounts}/>}
               
               </div>
               
    );
  }
}

export default App;
