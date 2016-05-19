const mustache = require('mustache');
const fs = require('fs');


const host = process.argv[process.argv.length-7];
const user = process.argv[process.argv.length-6];
const password = process.argv[process.argv.length-5];
const user_host = process.argv[process.argv.length-4];
const user_user = process.argv[process.argv.length-3];
const user_password = process.argv[process.argv.length-2];
const user_database = process.argv[process.argv.length-1];
console.log(`Setting Host ${host}, ${user} and ${password}. Setting User Host ${user_host}, ${user_user}, ${user_password} and ${user_database}`);
const config = {
  host: host,
  user: user,
  password: password,
  user_host: user_host,
  user_user: user_user,
  user_password: user_password,
  user_database: user_database,
};

const template = fs.readFileSync(`${__dirname}/../lib/config/config.mustache`, {encoding: 'utf-8'});
const output = mustache.render(template, config);
fs.writeFileSync(`${__dirname}/../lib/config/config.js`, output);
