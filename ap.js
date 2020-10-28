const fs = require('fs')
var configFile = fs.readFileSync('./files/polls/config_template.ini', 'utf-8')

const testConfig = {
  "unique": [
    "042",
    "043",
    "079",
    "133",
    "150",
    "173",
    "300",
    "306",
    "330",
    "335",
    "410"
  ],
  "exclude": {
    "175": {
      "restrict": [
        "181",
        "182",
        "183",
        "184",
        "185",
        "186"
      ]
    },
    "176": {
      "restrict": [
        "181",
        "182"
      ]
    },
    "177": {
      "restrict": [
        "081",
        "082",
        "083",
        "084",
        "085",
        "086"
      ]
    },
    "203": {
      "restrict": [
        "291",
        "292",
        "293",
        "294",
        "295",
        "296"
      ]
    }
  },
  "difficult": [
    "005",
    "014",
    "024",
    "044",
    "053",
    "080",
    "104",
    "114",
    "134",
    "151",
    "174",
    "180",
    "186",
    "194",
    "206",
    "264",
    "278",
    "289",
    "315",
    "395",
    "416",
    "432",
    "444"
  ],
  "diffUniq": [
    "044",
    "080",
    "134",
    "151",
    "174",
    "278",
    "289",
    "416"
  ],
  "freeAnswers": [
    "041",
    "132",
    "172",
    "204",
    "334",
    "350",
    "360",
    "362",
    "365",
    "370",
    "415",
    "450"
  ]
}

const newLineChar = process.platform === 'win32' ? '\r\n' : '\n';
let text = ''
for (let key in testConfig) {
  if (Array.isArray(testConfig[key])) {
    text += `[${key}]${newLineChar}`
    text += `answers = ${testConfig[key]}${newLineChar}`
    text += ` ${newLineChar}`
  } else {
    const obj = testConfig[key]
    let suffix = 1
    for (let k in obj) {
      text += `[${key}_${suffix}]${newLineChar}`
      text += `answers = ${k}${newLineChar}`
      text += `exclude = ${obj[k].restrict}${newLineChar}`
      text += `critical = 1${newLineChar}`
      text += ` ${newLineChar}`
      suffix++
    }
  }
}
const t = +new Date
fs.writeFileSync(`./files/polls/pollconfig_${t}.ini`, text)