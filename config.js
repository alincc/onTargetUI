/**
 * NOTE:: For local testing either make use of default or local and don't commit that changes.
 *
 */
module.exports = {
  default: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost:3214',
    nodeServer: 'http://int.app.ontargetcloud.com:9001',
    resourceUrl: 'http://int.app.ontargetcloud.com:9001',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local: {
    port: 9000,
    domain: 'http://localhost:9000/ontargetrs/services',
    baseUrl: 'http://localhost:9000',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://localhost:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local1: {
    port: 9002,
    domain: 'http://localhost:9002/ontargetrs/services',
    baseUrl: 'http://localhost:9002',
    nodeServer: 'http://localhost:9003',
    resourceUrl: 'http://localhost:9003',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://localhost:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  integration: {
    port: 9000,
    domain: 'http://int.app.ontargetcloud.com:9000/ontargetrs/services', 	// The domain should be same as the baseUrl because the proxy server was moved to the same Front-End web server
    baseUrl: 'http://int.app.ontargetcloud.com:9000', 						// Site domain
    nodeServer: 'http://int.app.ontargetcloud.com:9001', 					// Node server domain
    resourceUrl: 'http://int.app.ontargetcloud.com:9001', 					// This should be same as the node server because the resources are storing on the node server
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',		// API
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  beta: {
    port: 9004,
    domain: 'http://int.app.ontargetcloud.com:9004/ontargetrs/services', 	// The domain should be same as the baseUrl because the proxy server was moved to the same Front-End web server
    baseUrl: 'http://int.app.ontargetcloud.com:9004', 						// Site domain
    nodeServer: 'http://int.app.ontargetcloud.com:9005', 					// Node server domain
    resourceUrl: 'http://int.app.ontargetcloud.com:9005', 					// This should be same as the node server because the resources are storing on the node server
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',		// API
    BIM_SERVER: 'http://216.14.121.204:8080'		// API
  },
  testing: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  staging: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  sagarmatha01: {
    port: 9000,
    domain: 'https://app.ontargetcloud.com/ontargetrs/services',
    baseUrl: 'https://app.ontargetcloud.com',
    nodeServer: 'https://app.ontargetcloud.com',
    resourceUrl: 'https://app.ontargetcloud.com',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://172.31.59.54:8080/ontargetrs/services',
    BIM_SERVER: 'https://app.ontargetcloud.com/bimserver'
  },
  sagarmatha02: {
    port: 9000,
    domain: 'https://app.ontargetcloud.com/ontargetrs/services',
    baseUrl: 'https://app.ontargetcloud.com',
    nodeServer: 'https://app.ontargetcloud.com',
    resourceUrl: 'https://app.ontargetcloud.com',
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    // Proxy settings
    API_SERVER: 'http://172.31.48.59:8080/ontargetrs/services',
    BIM_SERVER: 'https://app.ontargetcloud.com/bimserver'
  },
  server: {
    PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serverlocal: {
    PROXY_URL: 'http://localhost:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serverintegration: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serverbeta: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  servertesting: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serverstaging: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serversagarmatha01: {
    PROXY_URL: 'http://172.31.59.54:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  },
  serversagarmatha02: {
    PROXY_URL: 'http://172.31.48.59:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000, // in bytes
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    }
  }
};