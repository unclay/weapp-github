const since = require('./since');
const language = require('./language');
const state = {
  trending: {
    language: language[0],
  },
  // domain: 'https://www.unclay.com',
  domain: 'http://192.168.1.10:8110',
  user: '',
  showWebViewGithubLogin: false,
};
module.exports = {
  since,
  language,
  state
}