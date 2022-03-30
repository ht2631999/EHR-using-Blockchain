
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract DoctorAddRecord{

  //--- patient mapped to files added by doctor ---
  mapping (address => doctorAddedFiles[]) private doctorAddedPatientFiles;

  struct doctorAddedFiles{
    string file_name;
    string file_type;
    string file_hash;
    address doc_id;
  }

  event doctorAddPatientFile(address _doctor, string msg, address _patient, uint gas_used);
  //--- function to add files from doctor end ---
  function doctorAddFiles(address _pat, string memory _file_name, string memory _file_type,string memory _file_hash) public
  {
    uint256 startGas = gasleft();  

    doctorAddedPatientFiles[_pat].push(doctorAddedFiles({file_name:_file_name, file_type:_file_type,file_hash:_file_hash, doc_id: msg.sender}));
      
    uint256 endGas = gasleft();
    uint256 gas_used = startGas-endGas;
    emit doctorAddPatientFile(msg.sender, "Added a file to patient record", _pat, gas_used);
  }

  function getDoctorAddedFiles(address pat) public view returns(doctorAddedFiles[] memory){
      return (doctorAddedPatientFiles[pat]);
    }  
}