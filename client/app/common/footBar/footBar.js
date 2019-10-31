import angular from 'angular';
import uiRouter from 'angular-ui-router';
import footBarComponent from './footBar.component';

let footBarModule = angular.module('footBar', [
  uiRouter
])

.component('footBar', footBarComponent)

.name;

export default footBarModule;
