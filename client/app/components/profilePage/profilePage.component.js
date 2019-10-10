import template from './profilePage.html';
import controller from './profilePage.controller';
import './profilePage.scss';

let profilePageComponent = {
  bindings: {
    config: '<'
  },
  template,
  controller
};

export default profilePageComponent;
