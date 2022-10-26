// This file is loaded up automatically by nextJS whenever our project starts up. 
// Next is then going to read the below script.
// We are changing a single option inside the webpack
// Rather than watching file changes in some automated faishon, 
// Instead we are saying to pull all the files inside of the directory
// once every 300 ms.
// NEXT JS does not restart automatically when it sees changes to this file
// Unlike changes that are made to react files. 

// So, somehow we need to get our pods restart itself.

module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};