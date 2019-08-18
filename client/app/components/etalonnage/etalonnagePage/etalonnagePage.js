import angular from 'angular';
import uiRouter, { map } from 'angular-ui-router';
import etalonnagePageComponent from './etalonnagePage.component';

let etalonnagePageModule = angular.module('etlonnage', [
  uiRouter
])

  .config(($stateProvider, $urlRouterProvider) => {
    "ngInject";

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('etalonnage', {
        url: '/',
        component: 'etalonnagePage',
        resolve: {
          config: ($http) => {
            'ngInject';

            return $http.get("config/etalonnage.json").then(reply => reply.data);
          }
        }
      });
  })

  .component('etalonnagePage', etalonnagePageComponent)

  .name;

export default etalonnagePageModule;
