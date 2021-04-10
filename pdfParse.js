const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('./Ros21-05.pdf');

pdf(dataBuffer).then(function (data) {
  console.log(data);
  // use data
})
  .catch(function (error) {
    // handle exceptions
  })