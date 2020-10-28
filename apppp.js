const fs = require('fs');
const pdf = require('pdf-parse');

const dataFolder = 'E:/WEB/_temp/taim/';

fs.readdir(dataFolder, (err, files) => {
  files.forEach(file => {
    const dataBuffer = fs.readFileSync(dataFolder + file);
    pdf(dataBuffer).then(function (data) {
      const text = data.text
      // нужный номер ПФР - 075030088799
      if (text.includes('034008096034'))
        console.log(file);
    });
  });
});