pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;


contract optimized_healthCare {

  address private owner;
  mapping (address => doctor) private doctors;
  
  mapping (address => patient) private patients; //mapping patients to their addresses
  mapping (address => mapping (address => uint16)) private patientToDoctor; //patients and list of doctors allowed access to
  mapping (address => mapping (bytes32 => uint16)) private patientToFile; //files mapped to patients
  mapping (address => files[]) private patientFiles;
  mapping (address => hospital) private hospitals;
  mapping (address => insuranceComp) insuranceCompanies;
  // mapping (address => doctorAddedFiles[]) private doctorAddedPatientFiles;
  // mapping (address => doctorOfferedConsultation[]) private doctorOfferedConsultationList;
  mapping (address => adhaar) patient_adhaar_info;
  mapping (address => adhaar) doctor_adhaar_info;


  struct adhaar{
    address id;
    uint64 adhaar_number;
    string name;
    string DOB;
    uint24 pincode;
  }

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
  
  //structure of Insurance companies
  struct insuranceComp{
    address id;  
    string name;
    mapping (address => uint8) regPatientsMapping;
    address[] regPatients;
  }
  

  //structure of patient info
  struct patient {
    string name;
    string DOB;
    uint64 adhaar_number;
    address id;
    string gender;
    string contact_info;

    bytes32[] files;// hashes of file that belong to this user for display purpose
    address[] doctor_list;
  }
  
 
  //structure of doctor info
  struct doctor {
      string name;
      address id;
      uint64 adhaar_number;
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

  function signupPatient(string memory _name, string memory _contact, string memory _gender) public {

    //search for patient on blockchain by address 
    patient storage p = patients[msg.sender];
    adhaar memory a = patient_adhaar_info[msg.sender];
    //Check if the patient already exists by address
    require(!(p.id > address(0x0)));
    //Add patient to blockchain
    require(a.adhaar_number > 0);

    patients[msg.sender] = patient({name:_name, DOB: a.DOB, id:msg.sender, adhaar_number: a.adhaar_number, gender:_gender, contact_info:_contact, files:new bytes32[](0), doctor_list:new address[](0)});
    

    emit patientSignUp( msg.sender, "Registered as Patient");
  }
  

  //Event to emit when new doctor registers
  event doctorSignUp(address _doctor, string message);

  function signupDoctor(address _id, string memory _name, string memory _contact, string memory _specialization) public {

      //search for doctor on blockchain
      doctor storage d = doctors[_id];
      adhaar memory a = doctor_adhaar_info[_id];
      //check name of doctor
      require(keccak256(abi.encodePacked(_name)) != keccak256(""));
      //check if doctor already exists
      require(!(d.id > address(0x0)));

      require(a.adhaar_number > 0);
      //Add the doctor to blockchain
      doctors[_id] = doctor({name:_name, id:_id, contact:_contact, adhaar_number: a.adhaar_number, specialization: _specialization, patient_list:new address[](0)});
     
      emit doctorSignUp(_id, "Registered as Doctor");
  }


  //Event to emit when patient grants access to doctor
  event grantDoctorAccess( address patient_address, string message, string _doctor, address doctor_address);
  
  function grantAccessToDoctor(address doctor_id) public checkPatient(msg.sender) checkDoctor(doctor_id) {
      
      patient storage p = patients[msg.sender];
      doctor storage d = doctors[doctor_id];
      require(patientToDoctor[msg.sender][doctor_id] < 1);// this means doctor already been access
      
      uint16 pos = (uint16)(p.doctor_list.push(doctor_id));// new length of array
      
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

    uint16 pdlength= (uint16)(p.doctor_list.length);
    uint16 pos=0;

    for (uint16 i = 0; i < pdlength; i++) {
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

    pdlength= (uint16)(d.patient_list.length);
    pos=0;

    for (uint16 i = 0; i < pdlength; i++) {
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



  function getPatientInfo() public view checkPatient(msg.sender) returns(string memory,address, string memory, bytes32[] memory , address[] memory, string memory, string memory) {
      
    patient memory p = patients[msg.sender];
    return (p.name, p.id, p.DOB, p.files, p.doctor_list, p.gender, p.contact_info );
  }



  function getDoctorInfo() public view checkDoctor(msg.sender) returns(string memory, address, address[] memory, string memory, string memory) {
      doctor memory d = doctors[msg.sender];

      return (d.name, d.id, d.patient_list, d.contact, d.specialization);
  }
  
  function checkDoctorInfo(uint64 _adhaar_number) public view returns(bool, address) {
    
    doctor memory d = doctors[msg.sender];
    adhaar memory a = doctor_adhaar_info[msg.sender];
    if (a.adhaar_number == _adhaar_number){
      return (true, d.id);
    }

    else 
      return (false, d.id);

  }

  function checkPatientInfo(uint64 _adhaar_number) public view returns(bool, address) {
    patient memory p = patients[msg.sender];
    adhaar memory a = patient_adhaar_info[msg.sender];
    if (a.adhaar_number == _adhaar_number){
      return (true,p.id);
    }

    else 
      return (false,p.id);

  }
  
  
  function getPatientInfoForDoctor(address pat) public view returns(string memory, string memory, address, files[] memory){
      patient memory p = patients[pat];
      return (p.name, p.DOB, p.id, patientFiles[pat]);
    }

  function getHospitalInfo() public view returns(address, string memory, string memory)
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
      
      uint16 pos = (uint16)(p.doctor_list.push(_user));// new length of array
      
      patientToDoctor[_patient][_user] = pos;
      d.patient_list.push(_patient);    
    }
  }

  function addHospital(address _id, string memory _name, string memory _location) public onlyOwner(){
    hospital memory h = hospitals[_id];
    require(!(h.id > address(0x0)));
    hospitals[_id] = hospital({id:_id, name:_name, location:_location});
  }
 
  function regInsuranceComp(address _id, string memory _name) public onlyOwner() {
    insuranceComp memory i= insuranceCompanies[_id];
    require(!(i.id> address(0x0)));
    insuranceCompanies[_id] = insuranceComp({id:_id, name:_name, regPatients: new address[](0)});
  } 

  function getInsuranceCompInfo() public view returns(address,string memory, address[] memory){
    insuranceComp memory i= insuranceCompanies[msg.sender];
    return(i.id,i.name,i.regPatients);
  }

  function addPatientToInsuranceComp(address _insuranceComp, address _pat) public{
    insuranceComp storage i = insuranceCompanies[_insuranceComp];
    require(i.regPatientsMapping[_pat]<1);
    uint8 pos=(uint8)(i.regPatients.push(_pat));
    i.regPatientsMapping[_pat]=pos;
  }



  function addDoctorAdhaarInfo(address _doc, string memory _name, string memory _DOB, uint24 _pincode, uint64 _adhaar_number) public {
    adhaar memory a = doctor_adhaar_info[_doc];
    require(a.adhaar_number == 0);
    doctor_adhaar_info[_doc] = adhaar({id:_doc, pincode: _pincode, name: _name, DOB: _DOB, adhaar_number: _adhaar_number});
  }

  function addPatientAdhaarInfo(address _pat, string memory _name, string memory _DOB, uint24 _pincode, uint64 _adhaar_number) public {
    adhaar memory a = patient_adhaar_info[_pat];
    require(a.adhaar_number == 0);
    patient_adhaar_info[_pat] = adhaar({id:_pat, pincode: _pincode, name: _name, DOB: _DOB, adhaar_number: _adhaar_number});
  }
  
}