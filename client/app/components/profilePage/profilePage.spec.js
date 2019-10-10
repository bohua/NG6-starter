import ProfilePageModule from './profilePage';
import ProfilePageController from './profilePage.controller';
import ProfilePageComponent from './profilePage.component';
import ProfilePageTemplate from './profilePage.html';

describe('ProfilePage', () => {
  let $rootScope, makeController;

  beforeEach(window.module(ProfilePageModule));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new ProfilePageController();
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
      expect(ProfilePageTemplate).to.match(/{{\s?\$ctrl\.name\s?}}/g);
    });
  });

  describe('Component', () => {
    // component/directive specs
    let component = ProfilePageComponent;

    it('includes the intended template', () => {
      expect(component.template).to.equal(ProfilePageTemplate);
    });

    it('invokes the right controller', () => {
      expect(component.controller).to.equal(ProfilePageController);
    });
  });
});
