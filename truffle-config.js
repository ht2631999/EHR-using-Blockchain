const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
       host: "127.0.0.1",     // Localhost (default: none)
       port: 8546,            // Standard Ethereum port (default: none)
       network_id: "*",       // Any network (default: none)
      }
  },
  
  compilers: {
    solc: {
      version: '^0.5.0',
      settings: {
        evmVersion: 'byzantium', // Default: "petersburg"
        optimizer: {
          enabled: true,
          runs: 1500
        }
      }
    }
  }
  
};
