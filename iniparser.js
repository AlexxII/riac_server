var mainLogic;

function parseIni(area) {
  let configData = area;
  // let configData = area.value;
  let regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
      comment: /^\s*#.*$/
  };
  let config = {};
  let lines = configData.split(/[\r\n]+/);
  let section = null;
  lines.forEach(function(line) {
      if (regex.comment.test(line)) {
          return;
      } else if (regex.param.test(line)) {
          let match = line.match(regex.param);
          if(section){
              config[section][match[1]] = parseParams(match[2]);
          } else {
              config[match[1]] = parseParams(match[2]);
          }
      } else if (regex.section.test(line)) {
          let match = line.match(regex.section);
          config[match[1]] = {};
          section = match[1];
      } else if (line.length == 0 && section) {
          section = null;
      }
  });
  // console.log(config);
  return concatLogic(config);
}

function concatLogic(config) {
  let regex = /([0-9]{1,})/gm;
  let result = {};
  let property = null;
  for (let key in config) {
    property = key.match(/[a-zA-Z]*/gm)[0];
    result[property] = {};
  }
  for (let key in config) {
    property = key.match(/[a-zA-Z]*/gm)[0];
    let suffix = key.match(regex);
    if (suffix !== null) {
      result[property][suffix] = config[key];
    } else {
      result[property][1] = config[key];
    }
  }
  return result;
}

function parseParams(data) {
  // избавляемся от пробелов
  let trimData = data.replace(/\s*/g,'');
  let regex = {
    // range : /\[(.+?)\]/gm,
    // single: /([0-9]{1,3})/gm,
    srange: /([0-9]{1,3})|\[(.+?)\]/gm
  };

  let output = [];
  let temp;
  do {
    temp = regex.srange.exec(trimData);
    if (temp) {
      // одиночные
      if (temp[1] !== undefined) {
        output.push(temp[1]);
      }
      // диапазон
      if (temp[2] !== undefined) {
        let range = temp[2];
        output = output.concat(rangeToArray(range));
      }
    }
  } while (temp);
  return output;
}

function rangeToArray(data) {
  let regex = /(\d{1,3})\s*-\s*(\d{1,3})/gm;
  let result = (data.replace(regex, (...match) => {
    let temp = [];
    let start = match[1];
    let end = match[2];
    // если перепутаны места
    if (start > end) {
      start = match[2];
      end = match[1];
    }
    let length = (end - start) + 1;
    while (length) {
      start = start + '';
      temp.push(start.padStart(3, '0'));
      start++
      length--;
    }
    return temp;
  }));
  return result.split(',');
}

module.exports = parseIni;