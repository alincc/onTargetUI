module.exports = {
  default: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  local: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  integration: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  testing: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  staging: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
  },
  production: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3215/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215'
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
    PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 5000000 // in bytes
  }
};