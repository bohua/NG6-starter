class FootBarController {
/**
* @param {qlikService} qlikService
* @param {utilService} utilService
* @param {stateService} stateService
*/
constructor(loadService, qlikService, stateService) {
  'ngInject';
  this.name = 'footBar';

  this.qlikService = qlikService;
  this.stateService = stateService;
  this.loadService = loadService;

  this.$onDestroy = () => {
    //console.log('footBar component Destroyed');
  }
}



$onInit() {
  let _this = this;

  this.loadService.loadConfig('system').then(data => {
    this.config = data;
  }).then( () => {
    if (this.showTimestamp) {
      this.qlikService.bindVisualizationData(this.config["last-load-timestamp"], cube => {
        let data = cube.qHyperCube.qDataPages[0].qMatrix[0];
        this.reloadTimestamp = data[0].qText;
      })
    }
  });
}

}

export default FootBarController;
