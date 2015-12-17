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
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
    bimServer: 'http://localhost:3214/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  nois: {
    port: 3214,
    domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',
    baseUrl: 'http://demo.newoceaninfosys.com:3214',
    nodeServer: 'http://demo.newoceaninfosys.com:3215',
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
    bimServer: 'http://demo.newoceaninfosys.com:3214/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local: {
    port: 9000,
    domain: 'http://localhost:9000/ontargetrs/services',
    baseUrl: 'http://localhost:9000',
    nodeServer: 'http://localhost:9001',
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
    bimServer: 'http://localhost:9000/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://localhost:9002',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://localhost:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  local1: {
    port: 9002,
    domain: 'http://localhost:9002/ontargetrs/services',
    baseUrl: 'http://localhost:9002',
    nodeServer: 'http://localhost:9003',
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
    bimServer: 'http://localhost:9002/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://localhost:8080/ontargetrs/services',
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  integration: {
    port: 9000,
    domain: 'http://int.app.ontargetcloud.com:9000/ontargetrs/services', 	// The domain should be same as the baseUrl because the proxy server was moved to the same Front-End web server
    baseUrl: 'http://int.app.ontargetcloud.com:9000', 						// Site domain
    nodeServer: 'http://int.app.ontargetcloud.com:9001', 					// Node server domain
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com', 					// This should be same as the node server because the resources are storing on the node server
    bimServer: 'http://int.app.ontargetcloud.com:9000/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://int.app.ontargetcloud.com:9002',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',		// API
    BIM_SERVER: 'http://216.14.121.204:8080'
  },
  beta: {
    port: 9004,
    domain: 'http://int.app.ontargetcloud.com:9004/ontargetrs/services', 	// The domain should be same as the baseUrl because the proxy server was moved to the same Front-End web server
    baseUrl: 'http://int.app.ontargetcloud.com:9004', 						// Site domain
    nodeServer: 'http://int.app.ontargetcloud.com:9005', 					// Node server domain
    resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com', 					// This should be same as the node server because the resources are storing on the node server
    bimServer: 'http://int.app.ontargetcloud.com:9004/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',		// API
    BIM_SERVER: 'http://216.14.121.204:8080'		// API
  },
  testing: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port',
    bimServer: 'http://hostname:port/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
  },
  staging: {
    port: 0,
    domain: 'http://hostname:port/ontargetrs/services',
    baseUrl: 'http://hostname:port',
    nodeServer: 'http://hostname:port',
    bimServer: 'http://hostname:port/bim',
    bimServerAddress: 'http://216.14.121.204:8080',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'bim@ontargetcloud.com',
      password: 'admin'
    },
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    weatherUrl: 'http://api.openweathermap.org/data/2.5/weather',
  },
  sagarmatha01: {
    port: 9000,
    domain: 'https://app.ontargetcloud.com/ontargetrs/services',
    baseUrl: 'https://app.ontargetcloud.com',
    nodeServer: 'https://app.ontargetcloud.com',
    resourceUrl: 'https://ontarget-assets.s3.amazonaws.com',
    bimServer: 'https://app.ontargetcloud.com/bim',
    bimServerAddress: 'https://app.ontargetcloud.com/bimserver',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'ontargetbim@ontargetcloud.com',
      password: '0nT4rg3tBIm2015'
    },
    pusher: {
      appId: '152503',
      apiKey: 'f0a0bf34cd094e438cba',
      secret: 'a2244d813cebbd30dc2e'
    },
    weatherUrl: 'https://app.ontargetcloud.com/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://172.31.59.54:8080/ontargetrs/services',
    BIM_SERVER: 'https://app.ontargetcloud.com/bimserver'
  },
  sagarmatha02: {
    port: 9000,
    domain: 'https://app.ontargetcloud.com/ontargetrs/services',
    baseUrl: 'https://app.ontargetcloud.com',
    nodeServer: 'https://app.ontargetcloud.com',
    resourceUrl: 'https://ontarget-assets.s3.amazonaws.com',
    bimServer: 'https://app.ontargetcloud.com/bim',
    bimServerAddress: 'https://app.ontargetcloud.com/bimserver',
    newBimServer: 'http://115.75.6.162:3216',
    bimCredential: {
      username: 'ontargetbim@ontargetcloud.com',
      password: '0nT4rg3tBIm2015'
    },
    pusher: {
      appId: '152503',
      apiKey: 'f0a0bf34cd094e438cba',
      secret: 'a2244d813cebbd30dc2e'
    },
    weatherUrl: 'https://app.ontargetcloud.com/data/2.5/weather',
    // Proxy settings
    API_SERVER: 'http://172.31.48.59:8080/ontargetrs/services',
    BIM_SERVER: 'https://app.ontargetcloud.com/bimserver'
  },
  server: {
    PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://localhost:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  serverNois: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root and the location should end with slash '/' if not empty
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://demo.newoceaninfosys.com:3215',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  serverlocal: {
    PROXY_URL: 'http://localhost:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://localhost:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  serverintegration: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://int.app.ontargetcloud.com:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  serverbeta: {
    PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrsbeta/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://localhost:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  servertesting: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://localhost:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets-test',
    aws_s3_region: 'us-east-1'
  },
  serverstaging: {
    PROXY_URL: 'http://hostname:port/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '138273',
      apiKey: 'c2f5de73a4caa3763726',
      secret: 'e2455e810e36cbed510e'
    },
    domain: 'http://localhost:9001',
    resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets',
    aws_s3_region: 'us-east-1'
  },
  serversagarmatha01: {
    PROXY_URL: 'http://172.31.59.54:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '152503',
      apiKey: 'f0a0bf34cd094e438cba',
      secret: 'a2244d813cebbd30dc2e'
    },
    domain: 'https://app.ontargetcoud.com',
    resource_domain: 'https://ontarget-assets.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets',
    aws_s3_region: 'us-east-1'
  },
  serversagarmatha02: {
    PROXY_URL: 'http://172.31.48.59:8080/ontargetrs/services',
    assetLocation: 'assets/', // empty is root
    maxFileSize: 25000000, // in bytes
    convertCommand: 'convert',
    gsCommand: 'gs',
    concurrencyImageProcesses: 1,
    pusher: {
      appId: '152503',
      apiKey: 'f0a0bf34cd094e438cba',
      secret: 'a2244d813cebbd30dc2e'
    },
    domain: 'https://app.ontargetcoud.com',
    resource_domain: 'https://ontarget-assets.s3.amazonaws.com',
    aws_s3_accessKeyId: 'AKIAIVHJTP4X5CBFYNLA',
    aws_s3_secretAccessKey: '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',
    aws_s3_bucket: 'ontarget-assets',
    aws_s3_region: 'us-east-1'
  }
};