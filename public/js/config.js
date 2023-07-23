window.config = {
  auth: {
    base: 'http://localhost:1080/auth',
    clientId: 'sylvia-iot-simple-ui',
    redirectUri: 'http://localhost:1080/#/sylvia-core/redirect',
    scopes: ['scope1'],
  },
  coremgr: {
    base: 'http://localhost:1080/coremgr',
  },
  data: {
    base: 'http://localhost:1080/data',
  },
  router: {
    base: 'http://localhost:1080/router',
  },
  loraIfroglab: {
    base: 'http://localhost:6080/lora-ifroglab',
  },
  appDemo: {
    base: 'http://localhost:7080/app-demo',
  },
};
