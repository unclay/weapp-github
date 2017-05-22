const since = require('./since');
const language = require('./language');
const state = {
  trending: {
    language: language[0],
  },
};
module.exports = {
  since,
  language,
  state
}