# HealthCare Using Ethereum Blockchain

## Project Objective
This project is developed with the aim to store patient healthcare records over blockchain.
The DApp build provides a patient centric system in which patient has control over his data i.e. patient themselves decide who can view their profiles/data. The system classifies the users into five categories: __Owner__, __Hospitals__, __Insurance Company__, __Doctor__ and __Patient__. 

Patient can grant or revoke data access permission to/from any doctor. Patients can also add files to their profile/data like reports, Xrays etc. which will be stored over IPFS. These files can help the doctors (who have been granted access) to review and treat patient accordingly. Also patients can view the past consultation records.

Doctors are provided with facility to view the patient records to which they have access granted. Doctors can view their patients' files and previous consultations too and can accordingly provide consultation or treatment.

![](./client/src/Components/Images/doc-patient.jpg)

## To run this project kindly install following prerequisites :

* "Truffle" v5.1.20
    * solc: "0.5.16"
    
* "Node" v12.16.1 (Install Following with npm)
  * "antd": "^3.9.0",
  * "axios": "^0.19.2",
  * "bootstrap": "^4.4.1",
  * "bs58": "^4.0.1",
  * "ipfs-api": "^26.1.2",
  * "react": "16.11.0",
  * "react-bootstrap": "^1.0.0",
  * "react-dom": "16.11.0",
  * "react-scripts": "3.2.0",
  * "web3": "1.2.2"

* Install Metamask as Browser extension.

* Install Ganache for deployement of Contracts.

## Steps to run project : 
1) Add ___truffle-config.js___ file in Ganache.
2) Create new network in ___metamask___ with port number same as in ___truffle-config.js___
3) Configure Ganache with same port number.
4) Goto Project Directory and run ___"truffle migrate"___ on command prompt.
5) Goto 'Client' directory using prompt and use ___"npm install"___ or ___"yarn install"___ (if your system has yarn).
6) run ___"npm start"___ to start react server.
7) Project will be open in your browser.
8) Import Ganache account(s) in metamask and use it for user login/register purpose.

Execution will start from __App.js__ file in client directory.

## TO-DO 
1) Improve UI design.


