pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;
import "./DoctorAddRecord.sol";

contract optimized_healthCare {
  
  DoctorAddRecord public doctorAddRecord;

  address private owner;
  mapping (address => doctor) private doctors;
  
  mapping (address => patient) private patients; //mapping patients to their addresses
  mapping (address => mapping (address => uint)) private patientToDoctor; //patients and list of doctors allowed access to
  mapping (address => mapping (bytes32 => uint)) private patientToFile; //files mapped to patients
  mapping (address => files[]) private patientFiles;
  mapping (address => hospital) private hospitals;

  
  
  //structure of patient file
  struct files{
      string file_name;
      string file_type;
      string file_hash;
  }
  
  //structure of hospital
  struct hospital{
    address id;  
    string name;
    string location;
  }
  

  //structure of patient info
  struct patient {
    string name;
    uint8 age;
    address id;
    string gender;
    string contact_info;

    string[] allergies;

    bytes32[] files;// hashes of file that belong to this user for display purpose
    address[] doctor_list;
  }
  
 
  //structure of doctor info
  struct doctor {
      string name;
      address id;
      string doc_address;
      string contact;
      string specialization;
      address[] patient_list;
  }
  

  //setting the owner
  constructor() public {
    owner = 0x5686638C16d74B6ef74CA24A10098a9360AC73F0;
  }
  
  //verify doctor 
  modifier checkDoctor(address id) {
    doctor memory d = doctors[id];
    require(d.id > address(0x0));//check if doctor exist
    _;
  }
  
  //verify patient
  modifier checkPatient(address id) {
    patient memory p = patients[id];
    require(p.id > address(0x0));//check if patient exist
    _;
  }

  //verify hospital
  modifier checkHospital(address id) {
    hospital memory h = hospitals[id];
    require(h.id > address(0x0));//check if patient exist
    _;
  }

  //owner verification modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
   


  function hospitalSignUp(address _id, string memory _name, string memory _location ) public onlyOwner() {
    
    hospital memory h= hospitals[_id];
    require(!(h.id > address(0x0)));
    require(keccak256(abi.encodePacked(_name)) != keccak256(""));
    hospitals[_id] = hospital({id:_id, name:_name, location: _location});
  }

  //Event to emit when new patient registers
  event patientSignUp( address _patient, string message);

  function signupPatient(string memory _name, uint8 _age, string memory _contact, string memory _gender) public {

    //search for patient on blockchain by address 
    patient storage p = patients[msg.sender];
    //check input name and age
    require(keccak256(abi.encodePacked(_name)) != keccak256(""));
    require((_age > 0) && (_age < 100));
    //Check if the patient already exists by address
    require(!(p.id > address(0x0)));
    //Add patient to blockchain
    patients[msg.sender] = patient({name:_name, age:_age, id:msg.sender, gender:_gender, contact_info:_contact, allergies:new string[](0), files:new bytes32[](0), doctor_list:new address[](0)});
    

    emit patientSignUp( msg.sender, "Registered as Patient");
  }
  

  //Event to emit when new doctor registers
  event doctorSignUp(address _doctor, string message);

  function signupDoctor(string memory _name, string memory _address, string memory _contact, string memory _specialization) public {

      //search for doctor on blockchain
      doctor storage d = doctors[msg.sender];
      //check name of doctor
      require(keccak256(abi.encodePacked(_name)) != keccak256(""));
      //check if doctor already exists
      require(!(d.id > address(0x0)));
      //Add the doctor to blockchain
      doctors[msg.sender] = doctor({name:_name, id:msg.sender, doc_address:_address, contact:_contact, specialization: _specialization, patient_list:new address[](0)});
     
      emit doctorSignUp(msg.sender, "Registered as Doctor");
  }


  //Event to emit when patient grants access to doctor
  event grantDoctorAccess( address patient_address, string message, string _doctor, address doctor_address);
  
  function grantAccessToDoctor(address doctor_id) public checkPatient(msg.sender) checkDoctor(doctor_id) {
      
      patient storage p = patients[msg.sender];
      doctor storage d = doctors[doctor_id];
      require(patientToDoctor[msg.sender][doctor_id] < 1);// this means doctor already been access
      
      uint pos = p.doctor_list.push(doctor_id);// new length of array
      
      patientToDoctor[msg.sender][doctor_id] = pos;
      d.patient_list.push(msg.sender);

   
      
      emit grantDoctorAccess( msg.sender , "Granted access to doctor", d.name , doctor_id);
  }

  //Event to emit when patient revokes a doctor's access
  event revokeDoctorAccess(address patient_address, string message, string _doctor, address doctor_address);

  function revokeAccessFromDoctor(address doctor_id) public checkPatient(msg.sender){
    require(patientToDoctor[msg.sender][doctor_id] > 0);
    patientToDoctor[msg.sender][doctor_id] = 0;


    patient storage p = patients[msg.sender];
    doctor storage d = doctors[doctor_id];

    uint pdlength= p.doctor_list.length;
    uint pos=0;

    for (uint i = 0; i < pdlength; i++) {
      if(p.doctor_list[i] == doctor_id)
      {
        pos=i;
        break;
      }
    }

    for(;pos<pdlength-1;pos++)
    {
      p.doctor_list[pos]= p.doctor_list[pos+1];
    }

    p.doctor_list.pop();

    pdlength= d.patient_list.length;
    pos=0;

    for (uint i = 0; i < pdlength; i++) {
      if(d.patient_list[i] == msg.sender)
      {
        pos=i;
        break;
      }
    }

    for(;pos<pdlength-1;pos++)
    {
      d.patient_list[pos]= d.patient_list[pos+1];
    }

    d.patient_list.pop();

    emit revokeDoctorAccess(msg.sender, "Revoked access of doctor", d.name, doctor_id);
  }
  


  function addUserFiles(string memory _file_name, string memory _file_type,string memory _file_hash) public{

    patientFiles[msg.sender].push(files({file_name:_file_name, file_type:_file_type,file_hash:_file_hash}));

  }


  function getUserFiles(address sender)public view returns(files[] memory){
      return patientFiles[sender];
  }



  function getPatientInfo() public view checkPatient(msg.sender) returns(string memory,address, uint8, bytes32[] memory , address[] memory) {
      patient memory p = patients[msg.sender];
      return (p.name,p.id, p.age, p.files, p.doctor_list);
  }



  function getDoctorInfo() public view checkDoctor(msg.sender) returns(string memory,address, address[] memory) {
      doctor memory d = doctors[msg.sender];
      return (d.name,d.id, d.patient_list);
  }
  
  
  
  function getPatientInfoForDoctor(address pat) public view returns(string memory, uint8, address, files[] memory){
      patient memory p = patients[pat];
      return (p.name, p.age, p.id, patientFiles[pat]);
    }

  function getHospitalInfo() public view checkHospital(msg.sender) returns(address, string memory, string memory)
  {
    hospital memory h = hospitals[msg.sender];
    return (h.id, h.name, h.location);
  }

  function getOwnerInfo() public view  onlyOwner() returns(address)
  {
    return (owner);
  }

  function hospitalGrantAccess(address _user, address _patient) public checkPatient(_patient)
  {
    doctor storage d = doctors[_user];
    patient storage p = patients[_patient];
    if(d.id > address(0x0))
    {
      require(patientToDoctor[_patient][_user] < 1);// this means doctor already been access
      
      uint pos = p.doctor_list.push(_user);// new length of array
      
      patientToDoctor[_patient][_user] = pos;
      d.patient_list.push(_patient);    
    }
  }

  function addHospital(address _id, string memory _name, string memory _location) public{
    hospital memory h = hospitals[_id];
    require(!(h.id > address(0x0)));
    hospitals[_id] = hospital({id:_id, name:_name, location:_location});
  }
 
}