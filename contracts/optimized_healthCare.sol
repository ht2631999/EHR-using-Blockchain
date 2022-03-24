pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract optimized_healthCare {
  
  address private owner;
  mapping (address => doctor) private doctors;
  
  mapping (address => patient) private patients; //mapping patients to their addresses
  mapping (address => mapping (address => uint)) private patientToDoctor; //patients and list of doctors allowed access to
  // mapping (bytes32 => filesInfo) private hashToFile; //filehash to file info
  mapping (address => mapping (bytes32 => uint)) private patientToFile; //files mapped to patients
  mapping (address => files[]) private patientFiles;
  mapping (address => doctorOfferedConsultation[]) doctorOfferedConsultationList;
  
  //consultation files added by doctor to patient record
  // mapping(address=> files[]) private doctorAddedPatientFiles; 
  
  
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
      // bytes32[] doctorAddedFiles; 

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
  

  // modifier checkFile(bytes32 fileHashId) {
  //   bytes memory tempString = bytes(hashToFile[fileHashId].file_name);
  //   require(tempString.length > 0);//check if file exist
  //   _;
  // }

  //Event to emit when new patient registers
  // event patientSignUp( address _patient, string message);

  function signupPatient(string memory _name, uint8 _age) public {
     //search for patient on blockchain by address 
     patient storage p = patients[msg.sender];
     //check input name and age
     require(keccak256(abi.encodePacked(_name)) != keccak256(""));
     require((_age > 0) && (_age < 100));
     //Check if the patient already exists by address
     require(!(p.id > address(0x0)));
     //Add patient to blockchain
    //  patients[msg.sender] = patient({name:_name,age:_age,id:msg.sender,files:new bytes32[](0),doctor_list:new address[](0), doctorAddedFiles: new bytes32[](0)});
     patients[msg.sender] = patient({name:_name,age:_age,id:msg.sender,files:new bytes32[](0),doctor_list:new address[](0)});


    //  emit patientSignUp( msg.sender, " has registered as Patient");
  }
  

  //Event to emit when new doctor registers
  // event doctorSignUp(address _doctor, string message);

  function signupDoctor(string memory _name) public {
      //search for doctor on blockchain
      doctor storage d = doctors[msg.sender];
      //check name of doctor
      require(keccak256(abi.encodePacked(_name)) != keccak256(""));
      //check if doctor already exists
      require(!(d.id > address(0x0)));
      //Add the doctor to blockchain
      doctors[msg.sender] = doctor({name:_name,id:msg.sender,patient_list:new address[](0)});
      // emit doctorSignUp(msg.sender, " has registered as Doctor");
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

      emit grantDoctorAccess( msg.sender , "Has granted access to a doctor", d.name , doctor_id);
  }

  function revokeAccessFromDoctor(address doctor_id) public checkPatient(msg.sender) checkDoctor(doctor_id) {
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
  }
  
  //Event to emit when patient adds a file successfully
  event fileAdd(string patient_name, address patient_address, string message);

  function addUserFiles(string memory _file_name, string memory _file_type,string memory _file_hash) public checkPatient(msg.sender){
      
      patientFiles[msg.sender].push(files({file_name:_file_name, file_type:_file_type,file_hash:_file_hash}));
      emit fileAdd(patients[msg.sender].name , msg.sender, "Added a file");
  }


  function getUserFiles(address sender)public view returns(files[] memory){
      return patientFiles[sender];
  }



  function getPatientInfo() public view checkPatient(msg.sender) returns(string memory,address, uint8, bytes32[] memory , address[] memory) {
      patient memory p = patients[msg.sender];
      return (p.name,p.id, p.age, p.files, p.doctor_list);
  }



  function getDoctorInfo() public view checkDoctor(msg.sender) returns(string memory,address, address[] memory){
      doctor memory d = doctors[msg.sender];
      return (d.name,d.id, d.patient_list);
  }
  
  // function checkProfile(address _user) public view onlyOwner returns(string memory, string memory){
  //     patient memory p = patients[_user];
  //     doctor memory d = doctors[_user];
      
  //     if(p.id > address(0x0))
  //         return (p.name, 'patient');
  //     else if(d.id > address(0x0))
  //         return (d.name, 'doctor');
  //     else
  //         return ('', '');
  //   }
  
  function getPatientInfoForDoctor(address pat) public view checkPatient(pat) checkDoctor(msg.sender) returns(string memory, uint8, address, files[] memory){
      patient memory p = patients[pat];

      //require(patientToDoctor[pat][msg.sender] > 0);

      return (p.name, p.age, p.id, patientFiles[pat]);
    }
  
  //  function getDoctorAddedFiles(address pat) public view checkPatient(pat) checkDoctor(msg.sender) returns(string memory, uint8, address, files[] memory){
  //     patient memory p = patients[pat];

  //     //require(patientToDoctor[pat][msg.sender] > 0);

  //     return (p.name, p.age, p.id, doctorAddedPatientFiles[pat]);
  //   }
  
  // function getFileInfo(bytes32 fileHashId) private view checkFile(fileHashId) returns(filesInfo memory) {
  //     return hashToFile[fileHashId];
  //   }
  
  // // function getFileSecret(bytes32 fileHashId, string memory role, address id, address pat) public view 
  // // checkFile(fileHashId) checkFileAccess(role, id, fileHashId, pat)
  // // returns(string memory) {
  // //     filesInfo memory f = getFileInfo(fileHashId);
  // //     return (f.file_secret);
  // //   }

  // function getFileInfoDoctor(address doc, address pat, bytes32 fileHashId) public view 
  // onlyOwner checkPatient(pat) checkDoctor(doc) checkFileAccess("doctor", doc, fileHashId, pat)
  // returns(string memory, string memory) {
  //     filesInfo memory f = getFileInfo(fileHashId);
  //     return (f.file_name, f.file_type);
  //   }
  
  // function getFileInfoPatient(address pat, bytes32 fileHashId) public view 
  // onlyOwner checkPatient(pat) checkFileAccess("patient", pat, fileHashId, pat) returns(string memory, string memory) {
  //     filesInfo memory f = getFileInfo(fileHashId);
  //     return (f.file_name, f.file_type);
  //   }

  // event doctorAddFile(string doctor_name, address doctor_address, string message, address patient_address, string patient_name);

  // function doctorAddConsultation(address _pat, string memory _file_name, string memory _file_type,string memory _file_hash) public checkDoctor(msg.sender)
  // {
  //   doctorAddedPatientFiles[_pat].push(files({file_name:_file_name, file_type:_file_type,file_hash:_file_hash}));
  //   // emit doctorAddFile(doctors[msg.sender].name , msg.sender, "Added consultation file for patient", _pat, patients[_pat].name);
  // }

  function addDoctorOfferedConsultation(address _pat, string memory _consultation, string memory _medicine, string  memory _time) public checkDoctor(msg.sender)
  {
    doctorOfferedConsultationList[_pat].push(doctorOfferedConsultation({doc_id:msg.sender, consultation_advice:_consultation,medicine:_medicine,time_period:_time}));
  }

  function getDoctorConsultation(address _pat)  public view checkPatient(_pat) checkDoctor(msg.sender) returns (doctorOfferedConsultation[] memory){
    return (doctorOfferedConsultationList[_pat]);
  }

  
  function getDoctorConsultationForPatient()  public view checkPatient(msg.sender) returns (doctorOfferedConsultation[] memory){
    return (doctorOfferedConsultationList[msg.sender]);
  }
}