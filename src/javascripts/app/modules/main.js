define(function (require) {
    'use strict';
    return {
        main: require('./main/main'),
        navbar: require('./navbar/navbar'),
        aside: require('./aside/aside'),
        signin: require('./signin/signin'),
        signup: require('./signup/signup'),
        forgotpassword: require('./forgotpassword/forgotpassword'),
        dashboard: require('./dashboard/dashboard'),
        requestdemo: require('./requestdemo/requestdemo'),
        demosignup: require('./demosignup/demosignup')
    };
});
