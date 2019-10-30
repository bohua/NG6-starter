import template from './footBar.html';
import controller from './footBar.controller';
import './footBar.scss';

let footBarComponent = {
  bindings: {
    showTimestamp: '@',
  },
  template,
  controller
};

export default footBarComponent;
