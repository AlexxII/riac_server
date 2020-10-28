const fs = require('fs')
const ini = require('ini')
const iniParser = require('./iniparser')


var configFile = fs.readFileSync('./files/polls/pollconfig_1600350303952.ini', 'utf-8')
// var configFile = fs.readFileSync('./files/polls/config_template.ini', 'utf-8')
const config = iniParser(configFile)
console.log(config);

/*
var config = ini.parse(fs.readFileSync('./files/polls/test.ini', 'utf-8'))
console.log(config);
config.unique.answers = [123, 124, 125]
config.difficult.answers = [444, 445, 556, 677]
config.freeAnswer.answers = [344, 345, 564]
config.test.answers = [233 - 234]
fs.writeFileSync('./files/polls/test_modified.ini', ini.encode(config))
*/