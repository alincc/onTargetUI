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
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services'
  },
  local: {
    port: 3214,
    domain: 'http://localhost:3214/ontargetrs/services',
    baseUrl: 'http://localhost.com:3214',
    nodeServer: 'http://int.app.ontargetcloud.com:9001',
    resourceUrl: 'http://int.app.ontargetcloud.com:9001',
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services'
  },
  local1: {
    port: 9002,
    domain: 'http://localhost:9002/ontargetrs/services',
    baseUrl: 'http://localhost:9002',
    nodeServer: 'http://localhost:9003',
    resourceUrl: 'http://localhost:9003',
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services'
  },
  integration: {
    port: 9000,
    domain: 'http://int.app.ontargetcloud.com:9000/ontargetrs/services', 	// The domain should be same as the baseUrl because the proxy server was moved to the same Front-End web server
    baseUrl: 'http://int.app.ontargetcloud.com:9000', 						// Site domain
    nodeServer: 'http://int.app.ontargetcloud.com:9001', 					// Node server domain
    resourceUrl: 'http://int.app.ontargetcloud.com:9001', 					// This should be same as the node server because the resources are storing on the node server
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services'		// API
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
  production: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port'
  },
  server: {
    PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 5000000 // in bytes
  },
  serverlocal: {
    PROXY_URL: 'http://localhost:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  },
  serverintegration: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  },
  servertesting: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  },
  serverstaging: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  },
  serverproduction: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  }
};