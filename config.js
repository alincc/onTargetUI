module.exports = {
  default: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://int.app.ontargetcloud.com:9001',
    resourceUrl: 'http://int.app.ontargetcloud.com:9001',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215',
    resourceUrl: 'http://demo.newoceaninfosys.com:3215',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  integration: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost:3214',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  testing: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost:3214',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  staging: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost:3214',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  production: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost:3214',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  server: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 1000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  }
};