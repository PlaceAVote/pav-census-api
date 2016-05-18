const mustache = require('mustache');
const fs = require('fs');

const host = process.argv[process.argv.length-3];
const user = process.argv[process.argv.length-2];
const password = process.argv[process.argv.length-1];

console.log(`Setting Host ${host}, ${user} and ${password}`);

const config = {
  host: host,
  user: user,
  password: password,
};

const template = fs.readFileSync(`${__dirname}/../lib/config/config.mustache`, {encoding: 'utf-8'});
const output = mustache.render(template, config);
fs.writeFileSync(`${__dirname}/../lib/config/config.js`, output);
