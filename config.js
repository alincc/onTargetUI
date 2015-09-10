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
  integration: {
    port: 9000,
    domain: 'http://int.app.ontargetcloud.com:9001/ontargetrs/services',
    baseUrl: 'http://int.app.ontargetcloud.com:8080',
    nodeServer: 'http://int.app.ontargetcloud.com:9001'
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
    assetLocation: 'assets/' // empty is root
  },
  serverlocal: {
    PROXY_URL: 'http://app.ontargetcloud.com:8080:8080/ontargetrs/services',
    assetLocation: 'assets/' // empty is root
  },
  serverintegrtion: {
    PROXY_URL: 'http://int.app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/' // empty is root
  }
};