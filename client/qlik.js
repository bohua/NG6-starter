var config = {
  "host": "rd-jzs-mashup.rdlund.qliktech.com",
  "prefix": "/",
  "port": "443",
  "isSecure": true
};
var appId = "0be01126-c204-46db-9ff2-7d995c3a4d9e";
var baseUrl = (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources";

window.require.config({
  baseUrl: baseUrl
});

require(["js/qlik"], function (qlik) {

  angular.module('app')
    .constant('qlik', {
      instance: qlik,
      config: config,
      appId: appId
    });

  angular.bootstrap(document, ['app', 'qlik-angular']);
});
