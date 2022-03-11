
var optHealthCare = artifacts.require("./optimized_healthCare.sol");
module.exports = function(deployer) {

  deployer.deploy(optHealthCare);
  
};
