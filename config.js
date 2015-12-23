/**
 * NOTE:: For local testing either make use of default or local and don't commit that changes.
 *
 */
module.exports = {
  envs:{
    nois:{
      // UI Configuration
      domain: 'http://demo.newoceaninfosys.com:3214/ontargetrs/services',           // Web UI Proxy api
      baseUrl: 'http://demo.newoceaninfosys.com:3214',                              // Web UI domain
      nodeServer: 'http://demo.newoceaninfosys.com:3215',                           // Node server domain
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
      maxFileSize: 25000000,                                                        // in bytes
      convertCommand: 'convert',                                                    // ImageMagick convert command
      gsCommand: 'gs',                                                              // Ghostscript command
      concurrencyImageProcesses: 1,                                                 // Concurrency Image Process
      aws_s3_profile: 'default',                                                    // AWS Profile name
      aws_s3_bucket: 'ontarget-assets-test'                                         // AWS S3 Bucket name
    }
  }
};