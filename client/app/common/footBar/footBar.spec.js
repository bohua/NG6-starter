import FootBarModule from './footBar';
import FootBarController from './footBar.controller';
import FootBarComponent from './footBar.component';
import FootBarTemplate from './footBar.html';

describe('FootBar', () => {
  let $rootScope, makeController;

  beforeEach(window.module(FootBarModule));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new FootBarController();
    };
  }));

  describe('Module', () => {
    // top-level specs: i.e., routes, injection, naming
  });

  describe('Controller', () => {
    // controller specs
    it('has a name property [REMOVE]', () => { // erase if removing this.name from the controller
      let controller = makeController();
      expect(controller).to.have.property('name');
    });
  });

  describe('Template', () => {
    // template specs
    // tip: use regex to ensure correct bindings are used e.g., {{  }}
    it('has name in template [REMOVE]', () => {
      expect(FootBarTemplate).to.match(/{{\s?\$ctrl\.name\s?}}/g);
    });
  });

  describe('Component', () => {
    // component/directive specs
    let component = FootBarComponent;

    it('includes the intended template', () => {
      expect(component.template).to.equal(FootBarTemplate);
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(FootBarController);
    });
  });
});
