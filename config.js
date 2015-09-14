/**
 * NOTE:: For local testing either make use of default or local and don't commit that changes.
 *
 */
module.exports = {
  default: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  local: {
    port: 9000,
    domain: 'http://localhost:9001/ontargetrs/services',
    baseUrl: 'http://localhost:8080',
    nodeServer: 'http://localhost:9001'
  },
  local1: {
    port: 9002,
    domain: 'http://localhost:9003/ontargetrs/services',
    baseUrl: 'http://localhost:8080',
    nodeServer: 'http://localhost:9003'
  },
  integration: {
    port: 9000,
    domain: 'http://int.app.ontargetcloud.com:9001/ontargetrs/services',
    baseUrl: 'http://int.api.ontargetcloud.com:8080',
    nodeServer: 'http://int.app.ontargetcloud.com:9001'
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