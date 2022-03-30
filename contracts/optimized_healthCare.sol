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
  mapping (address => doctorOfferedConsultation[]) private doctorOfferedConsultationList;

  //structure of doctor added files
  struct doctorAddedFiles{
    string file_name;
    string file_type;
    string file_hash;
    address doc_id;
  }
  
  //structure of patient file
  struct files{
      string file_name;
      string file_type;
      string file_hash;
  }

  
  
  //File-info
  struct filesInfo {
      string file_name;
      string file_type;
      string file_secret;
  }
  

  //structure of patient info
  struct patient {
      string name;
      uint8 age;
      address id;
      bytes32[] files;// hashes of file that belong to this user for display purpose

      //hashes of files that doctor added after consultation for display purpose 
      address[] doctor_list;
  }
  
  // structure for doctor offered consultation
  struct doctorOfferedConsultation
  {
    address doc_id;
    string consultation_advice;
    string medicine;
    string time_period;
  }

  //structure of doctor info
  struct doctor {
      string name;
      address id;
      address[] patient_list;
  }
  

  //setting the owner
  constructor() public {
    owner = msg.sender;
  }
  
  
  //verify doctor on blockchain
  modifier checkDoctor(address id) {
    doctor memory d = doctors[id];
    require(d.id > address(0x0));//check if doctor exist
    _;
  }
  
  //verify patient on blockchain
  modifier checkPatient(address id) {
    patient memory p = patients[id];
    require(p.id > address(0x0));//check if patient exist
    _;
  }
  

  //owner verification modifier
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
   

  //check if user has file access
  modifier checkFileAccess(string memory role, address id, bytes32 fileHashId, address pat) {
    uint pos;
    //check if doctor trying to access the file
    if(keccak256(abi.encodePacked(role)) == keccak256("doctor")) {
        //check if patient granted access to doctor
        require(patientToDoctor[pat][id] > 0);
        pos = patientToFile[pat][fileHashId];
        require(pos > 0);   
    }
    //check if patient trying to access the file
    else if(keccak256(abi.encodePacked(role)) == keccak256("patient")) 
    {
        //check if file belongs to patient
        pos = patientToFile[id][fileHashId];
        require(pos > 0);
    }
    _; 
  }
  


  //Event to emit when new patient registers
  event patientSignUp( address _patient, string message, uint256 gas_used);

  function signupPatient(string memory _name, uint8 _age) public {

    uint256 startGas = gasleft();
    //search for patient on blockchain by address 
    patient storage p = patients[msg.sender];
    //check input name and age
    require(keccak256(abi.encodePacked(_name)) != keccak256(""));
    require((_age > 0) && (_age < 100));
    //Check if the patient already exists by address
    require(!(p.id > address(0x0)));
    //Add patient to blockchain
    patients[msg.sender] = patient({name:_name,age:_age,id:msg.sender,files:new bytes32[](0),doctor_list:new address[](0)});
    
    uint256 endGas = gasleft();
    uint256 gas_used= startGas-endGas;

    emit patientSignUp( msg.sender, "Registered as Patient", gas_used);
  }
  

  //Event to emit when new doctor registers
  event doctorSignUp(address _doctor, string message, uint256 gas_used);

  function signupDoctor(string memory _name) public {

      uint256 startGas = gasleft();
      //search for doctor on blockchain
      doctor storage d = doctors[msg.sender];
      //check name of doctor
      require(keccak256(abi.encodePacked(_name)) != keccak256(""));
      //check if doctor already exists
      require(!(d.id > address(0x0)));
      //Add the doctor to blockchain
      doctors[msg.sender] = doctor({name:_name,id:msg.sender,patient_list:new address[](0)});
      uint256 endGas = gasleft();
      uint256 gas_used = startGas-endGas;
      emit doctorSignUp(msg.sender, "Registered as Doctor",gas_used);
  }


  //Event to emit when patient grants access to doctor
  event grantDoctorAccess( address patient_address, string message, string _doctor, address doctor_address, uint256 gas_used);
  
  function grantAccessToDoctor(address doctor_id) public checkPatient(msg.sender) checkDoctor(doctor_id) {
      uint256 startGas = gasleft();
      patient storage p = patients[msg.sender];
      doctor storage d = doctors[doctor_id];
      require(patientToDoctor[msg.sender][doctor_id] < 1);// this means doctor already been access
      
      uint pos = p.doctor_list.push(doctor_id);// new length of array
      
      patientToDoctor[msg.sender][doctor_id] = pos;
      d.patient_list.push(msg.sender);

      uint256 endGas = gasleft();
      uint256 gas_used = startGas-endGas;
      emit grantDoctorAccess( msg.sender , "Granted access to doctor", d.name , doctor_id, gas_used);
  }

  //Event to emit when patient revokes a doctor's access
  event revokeDoctorAccess(address patient_address, string message, string _doctor, address doctor_address,uint256 gas_used);

  function revokeAccessFromDoctor(address doctor_id) public checkPatient(msg.sender) checkDoctor(doctor_id) {
    uint256 startGas = gasleft();
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
    uint256 endGas = gasleft();
    uint256 gas_used = startGas-endGas;

    emit revokeDoctorAccess(msg.sender, "Revoked access of doctor", d.name, doctor_id, gas_used);
  }
  
  //Event to emit when patient adds a file successfully
  event fileAdd(string patient_name, address patient_address, string message, uint256 gas_used);

  function addUserFiles(string memory _file_name, string memory _file_type,string memory _file_hash) public checkPatient(msg.sender){
    uint256 startGas = gasleft();  

    patientFiles[msg.sender].push(files({file_name:_file_name, file_type:_file_type,file_hash:_file_hash}));
      
    uint256 endGas = gasleft();
    uint256 gas_used = startGas-endGas;
    emit fileAdd(patients[msg.sender].name , msg.sender, "Added a file",gas_used);
  }


  function getUserFiles(address sender)public view returns(files[] memory){
      return patientFiles[sender];
  }



  function getPatientInfo() public view checkPatient(msg.sender) returns(string memory,address, uint8, bytes32[] memory , address[] memory) {
      patient memory p = patients[msg.sender];
      return (p.name,p.id, p.age, p.files, p.doctor_list);

      //if adding feature of doctorAddedPatientFiles
      //return (p.name, p.age, p.id, patientFiles[pat],doctorAddedPatientFiles[pat]);
  }



  function getDoctorInfo() public view checkDoctor(msg.sender) returns(string memory,address, address[] memory){
      doctor memory d = doctors[msg.sender];
      return (d.name,d.id, d.patient_list);
  }
  
  
  
  function getPatientInfoForDoctor(address pat) public view checkPatient(pat) checkDoctor(msg.sender) returns(string memory, uint8, address, files[] memory){
      patient memory p = patients[pat];
      return (p.name, p.age, p.id, patientFiles[pat]);

      //if adding feature of doctorAddedPatientFiles
      //return (p.name, p.age, p.id, patientFiles[pat],doctorAddedPatientFiles[pat]);
    }

  event doctorOfferConsultation(address _doctor, string message, address _patient, string _consultation, string _medicine, uint256 gas_used);

  function addDoctorOfferedConsultation(address _pat, string memory _consultation, string memory _medicine, string  memory _time) public checkDoctor(msg.sender)
  {
    uint256 startGas = gasleft();
    doctorOfferedConsultationList[_pat].push(doctorOfferedConsultation({doc_id:msg.sender, consultation_advice:_consultation,medicine:_medicine,time_period:_time}));
    
    uint256 endGas = gasleft();
    uint256 gas_used = startGas-endGas;
    emit doctorOfferConsultation(msg.sender, "Provided consultation to", _pat, _consultation, _medicine, gas_used);
  }

  function getDoctorConsultation(address _pat)  public view checkPatient(_pat) checkDoctor(msg.sender) returns (doctorOfferedConsultation[] memory){
    return (doctorOfferedConsultationList[_pat]);
  }

  
  function getDoctorConsultationForPatient()  public view checkPatient(msg.sender) returns (doctorOfferedConsultation[] memory){
    return (doctorOfferedConsultationList[msg.sender]);
  }

}