// default config
module.exports = {
  workers: 1,
  port: 8110,
  github: {
    client_id: '',
    client_secret: ''
  },
  weapp: {
    appId: '',
    appSecret: '',
    wxLoginExpires: 7200,
    wxMessageToken: ''
  },
  cookieName: 'weapp-github' // 请与adapter的cookie保持一致
};
