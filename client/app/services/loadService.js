export default class loadService {
  constructor($http, qlikService) {
    'ngInject';

    let _this = this;
    let promises = [];

    this.config = {};

    promises.push($http.get("config/navigation.json").then(reply => _this.config.navigation = reply.data));
    promises.push($http.get("config/filters.json").then(reply => _this.config.filters = reply.data));
    promises.push($http.get("config/etalonnage.json").then(reply => _this.config.etalonnage = reply.data));
    promises.push($http.get("config/comparaisons.json").then(reply => _this.config.comparaisons = reply.data));
    promises.push($http.get("config/profile.json").then(reply => _this.config.profile = reply.data));
    promises.push($http.get("config/system.json").then(reply => _this.config.system = reply.data));
    
    this.initialized = Promise.all(promises).then(() => {
      let bmId = _this.config.system["onopen-bookmark"];
      qlikService.applyBookmark(bmId);
    });
  }

  loadConfig(name) {
    let _this = this;
    return this.initialized.then(() => {
      return _this.config[name];
    });
  }
}
