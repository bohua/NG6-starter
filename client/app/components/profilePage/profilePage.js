import angular from 'angular';
import uiRouter from 'angular-ui-router';
import profilePageComponent from './profilePage.component';

let profilePageModule = angular.module('profilePage', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('profile', {
      url: '/profile',
      component: 'profilePage',
      resolve: {
        config: (loadService) => {
          'ngInject';
          return loadService.loadConfig('profile');
        },
        bookmark: (loadService) => {
          'ngInject';
          return loadService.applyBookmark();
        }
      }
    });
})

.component('profilePage', profilePageComponent)

.name;

export default profilePageModule;
