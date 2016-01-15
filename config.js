/**
 * NOTE:: For local testing either make use of default or local and don't commit that changes.
 *
 */
module.exports = {
  envs: {
    nois: {
      // UI Configuration
      domain: 'http://nois2.newoceaninfosys.com:3214/ontargetrs/services',           // Web UI Proxy api
      baseUrl: 'http://nois2.newoceaninfosys.com:3214',                              // Web UI domain
      nodeServer: 'http://nois2.newoceaninfosys.com:3215',                           // Node server domain
      resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',                 // Resource domain
      newBimServer: 'http://115.75.6.162:3216',                                     // Bim server domain
      pusher: {                                                                     //
        appId: '138273',                                                            //
        apiKey: 'c2f5de73a4caa3763726',                                             // Pusher Configuration
        secret: 'e2455e810e36cbed510e'                                              //
      },                                                                            //
      weatherUrl: 'http://api.openweathermap.org/data/2.5/forecast',                // Open weather api
      API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',      // API domain
      assetLocation: 'assets/',                                                     // empty is root and the location should end with slash '/' if not empty
      maxFileSize: 600000000,                                                        // in bytes
      convertCommand: 'convert',                                                    // ImageMagick convert command
      gsCommand: 'gs',                                                              // Ghostscript command
      concurrencyImageProcesses: 1,                                                 // Concurrency Image Process
      aws_s3_profile: 'default',                                                    // AWS Profile name
      aws_s3_bucket: 'ontarget-assets-test',                                        // AWS S3 Bucket name
      excelTemplateUrl: 'https://s3.amazonaws.com/ontarget-assets-test/assets/onTarget+-+Import+Format.xlsx', // Upload file to s3 manually, put it to assets folder, then copy the link
      bim_user: 'ontargetintbim@ontargetcloud.com',
      bim_password: '!ontargetintbim!',
      bimServer: 'http://localhost:9000/bim',
      bimServerAddress: 'http://52.0.49.87:8080/bimserver'
    },
    local: {
      domain: 'http://localhost:9000/ontargetrs/services',
      baseUrl: 'http://localhost:9000',
      nodeServer: 'http://localhost:9001',
      resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
      newBimServer: 'http://localhost:9002',
      pusher: {
        appId: '138273',
        apiKey: 'c2f5de73a4caa3763726',
        secret: 'e2455e810e36cbed510e'
      },
      weatherUrl: 'http://api.openweathermap.org/data/2.5/forecast',
      // Proxy settings
      API_SERVER: 'http://localhost:8080/ontargetrs/services',
      assetLocation: 'assets/', // empty is root
      maxFileSize: 600000000, // in bytes
      convertCommand: 'convert',
      gsCommand: 'gs',
      concurrencyImageProcesses: 1,
      aws_s3_profile: 'default',
      aws_s3_bucket: 'ontarget-assets-test',
      excelTemplateUrl: 'https://s3.amazonaws.com/ontarget-assets-test/assets/onTarget+-+Import+Format.xlsx',
      bim_user: 'ontargetintbim@ontargetcloud.com',
      bim_password: '!ontargetintbim!',
      bimServer: 'http://localhost:9000/bim',
      bimServerAddress: 'http://52.0.49.87:8080/bimserver'
    },
    integration: {
      domain: 'http://int.app.ontargetcloud.com:9000/ontargetrs/services',
      baseUrl: 'http://int.app.ontargetcloud.com:9000',
      nodeServer: 'http://int.app.ontargetcloud.com:9001',
      resourceUrl: 'https://ontarget-assets-test.s3.amazonaws.com',
      newBimServer: 'http://int.app.ontargetcloud.com:9002',
      pusher: {
        appId: '138273',
        apiKey: 'c2f5de73a4caa3763726',
        secret: 'e2455e810e36cbed510e'
      },
      weatherUrl: 'http://api.openweathermap.org/data/2.5/forecast',
      // Proxy settings
      API_SERVER: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
      assetLocation: 'assets/', // empty is root
      maxFileSize: 600000000, // in bytes
      convertCommand: 'convert',
      gsCommand: 'gs',
      concurrencyImageProcesses: 1,
      aws_s3_profile: 'default',
      aws_s3_bucket: 'ontarget-assets-test',
      excelTemplateUrl: 'https://s3.amazonaws.com/ontarget-assets-test/assets/onTarget+-+Import+Format.xlsx',
      bim_user: 'ontargetintbim@ontargetcloud.com',
      bim_password: '!ontargetintbim!',
      bimServer: 'http://int.app.ontargetcloud.com:9000/bim',
      bimServerAddress: 'http://52.0.49.87:8080/bimserver'

    },
    sagarmatha01: {
      domain: 'https://app.ontargetcloud.com/ontargetrs/services',
      baseUrl: 'https://app.ontargetcloud.com',
      nodeServer: 'https://app.ontargetcloud.com',
      resourceUrl: 'https://ontarget-assets.s3.amazonaws.com',
      newBimServer: 'https://app.ontargetcloud.com/bim',
      pusher: {
        appId: '152503',
        apiKey: 'f0a0bf34cd094e438cba',
        secret: 'a2244d813cebbd30dc2e'
      },
      weatherUrl: 'https://app.ontargetcloud.com/data/2.5/forecast',
      // Proxy settings
      API_SERVER: 'http://172.31.59.54:8080/ontargetrs/services',
      assetLocation: 'assets/', // empty is root
      maxFileSize: 600000000, // in bytes
      convertCommand: 'convert',
      gsCommand: 'gs',
      concurrencyImageProcesses: 1,
      aws_s3_profile: 'production',
      aws_s3_bucket: 'ontarget-assets',
      excelTemplateUrl: 'https://s3.amazonaws.com/ontarget-assets-test/assets/onTarget+-+Import+Format.xlsx',
      bim_user: 'bim@ontargetcloud.com',
      bim_password: 'admin',
      bimServer: 'http://localhost:9000/bim',
      bimServerAddress: 'http://216.14.121.204:8080'
    },
    sagarmatha02: {
      domain: 'https://app.ontargetcloud.com/ontargetrs/services',
      baseUrl: 'https://app.ontargetcloud.com',
      nodeServer: 'https://app.ontargetcloud.com',
      resourceUrl: 'https://ontarget-assets.s3.amazonaws.com',
      newBimServer: 'https://app.ontargetcloud.com/bim',
      pusher: {
        appId: '152503',
        apiKey: 'f0a0bf34cd094e438cba',
        secret: 'a2244d813cebbd30dc2e'
      },
      weatherUrl: 'https://app.ontargetcloud.com/data/2.5/forecast',
      // Proxy settings
      API_SERVER: 'http://172.31.48.59:8080/ontargetrs/services',
      assetLocation: 'assets/', // empty is root
      maxFileSize: 600000000, // in bytes
      convertCommand: 'convert',
      gsCommand: 'gs',
      concurrencyImageProcesses: 1,
      aws_s3_profile: 'production',
      aws_s3_bucket: 'ontarget-assets',
      excelTemplateUrl: 'https://s3.amazonaws.com/ontarget-assets-test/assets/onTarget+-+Import+Format.xlsx',
      bim_user: 'bim@ontargetcloud.com',
      bim_password: 'admin',
      bimServer: 'http://localhost:9000/bim',
      bimServerAddress: 'http://216.14.121.204:8080'
    }
  }
};