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
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local: {
    port: 9000,
    domain: 'http://localhost:9000/ontargetrs/services',
    baseUrl: 'http://localhost.com:9000',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'http://localhost:9001',
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
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',		// API
    BIM_SERVER: 'http://216.14.121.204:8080'		// API
  },
  testing: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port'
  },
  staging: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port'
  },
  sagarmatha01: {
    port: 9000,
    domain: 'http://172.31.59.54:9000/ontargetrs/services',
    baseUrl: 'http://172.31.59.54:9000',
    nodeServer: 'http://172.31.59.54:9001',
    resourceUrl: 'http://172.31.59.54:9001',
    // Proxy settings
    API_SERVER: 'http://172.31.59.54:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  sagarmatha02: {
    port: 9000,
    domain: 'http://172.31.48.59:9000/ontargetrs/services',
    baseUrl: 'http://172.31.48.59:9000',
    nodeServer: 'http://172.31.48.59:9001',
    resourceUrl: 'http://172.31.48.59:9005',
    // Proxy settings
    API_SERVER: 'http://172.31.48.59:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  server: {
    PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 15000000 // in bytes
  },
  serverlocal: {
    PROXY_URL: 'http://localhost:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  serverintegration: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  serverbeta: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  servertesting: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  serverstaging: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  serversagarmatha01: {
    PROXY_URL: 'http://172.31.59.54:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  },
  serversagarmatha02: {
    PROXY_URL: 'http://172.31.48.59:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 15000000 // in bytes
  }
};