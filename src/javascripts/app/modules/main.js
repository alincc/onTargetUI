define(function (require){
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
    demosignup: require('./demosignup/demosignup'),
    pendingUserManagement: require('./pendingUserManagement/pendingUserManagement'),
    project: require('./project/project'),
    resetpassword: require('./resetpassword/resetpassword'),
    onTime: require('./onTime/onTime'),
    onSite: require('./onSite/onSite'),
    editprofile: require('./editprofile/editprofile'),
    company: require('./editCompany/company'),
    changePassword: require('./changePassword/changePassword'),
    notification: require('./notifications/notifications')
  };
});
