import angular from 'angular';
import EtlonnagePage from './etalonnagePage/etalonnagePage';
import ComparaisonPage from './comparaisonsPage/comparaisonsPage';
import ProfilePage from './profilePage/profilePage';

let componentModule = angular.module('app.components', [
  EtlonnagePage,
  ComparaisonPage,
  ProfilePage
])

  .name;

export default componentModule;
