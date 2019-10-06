import template from './compareTable.html';
import controller from './compareTable.controller';
import './compareTable.scss';

let compareTableComponent = {
  bindings: {
    header: '<',
    data: '<',
    refColor: '<',
    refType: '<',
    horizontalHeader: '<'
  },
  template,
  controller
};

export default compareTableComponent;
