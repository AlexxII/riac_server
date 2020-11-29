const { v4: uuidv4 } = require('uuid');

const count = process.argv.slice(2)

for (let i = 0; i < count; i++) {
  console.log(uuidv4());
}