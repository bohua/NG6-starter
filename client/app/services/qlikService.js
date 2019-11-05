export default class qlikService {
  constructor(qlik) {
    'ngInject';
    this.qlik = qlik.instance;
    this.config = qlik.config;
    this.app = qlik.instance.openApp(qlik.appId, qlik.config);
  }

  getVisualization(element, objectId) {
    return this.app.getObject(element, objectId);
  }

  getVisualObj(objectId) {
    return this.app.visualization.get(objectId);
  }

  field(field, callback) {
    let f = this.app.field(...field).getData();
    f.OnData.bind(callback);
    return f;
  }

  select(field, values, state, toggle) {
    return this.app.field(field, state).selectValues(values, toggle);
  }

  getVariable(name, callback) {
    return this.app.variable.getContent(name, reply => {
      let v = reply.qContent.qIsNum ? reply.qContent.qString / 1 : reply.qContent.qString;
      return callback(v);
    });
  }

  setVariable(name, value) {
    if (isNaN(value)) {
      return this.app.variable.setStringValue(name, value);
    } else {
      return this.app.variable.setNumValue(name, value);
    }
  }

  applyBookmark(id) {
    return this.app.bookmark.apply(id);
  }

  resize() {
    this.qlik.resize();
  }

  bindListData(listExp, callback) {
    let _this = this;

    return _this.app.createList({
      "qDef": {
        "qFieldDefs": [
          listExp
        ]
      },
      "qInitialDataFetch": [{
        qTop: 0,
        qLeft: 0,
        qHeight: 20,
        qWidth: 1
      }]
    }, callback);
  }

  bindVisualizationData(objectId, callback) {
    let _this = this;

    return _this.app.getObjectProperties(objectId).then(model => {

      let qHyperCubeDef = model.enigmaModel.properties.qHyperCubeDef;

      qHyperCubeDef.qInitialDataFetch = [{
        qTop: 0,
        qLeft: 0,
        qHeight: 100,
        qWidth: 20
      }];

      return _this.app.createCube(qHyperCubeDef, callback);
    });
  }

  exportData(qlikObj) {
    qlikObj.exportData().then(reply => {
      //console.log(reply)

      let baseUri = (this.config.isSecure ? "https://" : "http://") + this.config.host + (this.config.port ? ":" + this.config.port : "") + this.config.prefix;
      let dataUri = baseUri + reply.qUrl.substr(1);
      let fileName = "Data.xlsx";

      var a = document.createElement("a");
      a.style = "display:none";
      a.href = dataUri;
      a.download = fileName;
      a.click();
      console.log("Report downloaded");
    });
  }

  createFilterList(filter) {
    return this.app.visualization.create(
      'listbox',
      [filter.field],
      {
        "showTitle": true,
        "title": filter.title
      }
    )
  }

  fieldSelection(field, state, callback) {
    let selState = this.app.selectionState(state);
    let listener = function() {
      let selections = selState.selections;
      let sels = selections.filter(s => {return s.fieldName === field;});
      if(sels.length != 1 || sels[0].selectedCount === 0) {
        callback(null);
      } else {
        callback(sels[0]);
      }
      selState.OnData.unbind( listener );
    };
    selState.OnData.bind( listener );
  }

  fieldSelectionV2(field, state, callback) {
    let srcField = this.app.field(field, state).getData();
    let listener = ()=> {
      let selectedValues = srcField.rows.filter(r => {return r.qState==="S";}).map(r => r.qText);
      if(callback) {
        callback(selectedValues);
      }
      srcField.OnData.unbind(listener);
    };
    srcField.OnData.bind(listener);
  }

  fieldStateTransfer(field, src, dst, toggle) {
    let srcField = this.app.field(field, src).getData();
    let listener = ()=> {
      let selectedValues = srcField.rows.filter(r => {return r.qState==="S";}).map(r => r.qText);
      this.app.field(field, dst).selectValues(selectedValues, toggle);
      srcField.OnData.unbind(listener);
    };
    srcField.OnData.bind(listener);
  }

  field2StatesTransfer(field, src1, src2, dst) {
    let srcField1 = this.app.field(field, src1).getData();
    let srcField2 = this.app.field(field, src2).getData();
    let listener2 = (sels)=> {
      let selectedValues2 = srcField2.rows.filter(r => {return r.qState==="S";}).map(r => r.qText);
      let selectedValues = sels.concat(selectedValues2).filter((x, i, a) => a.indexOf(x) == i);
      this.app.field(field, dst).selectValues(selectedValues);
      srcField2.OnData.unbind(listener2);
    };
    let listener1 = ()=> {
      let selectedValues1 = srcField1.rows.filter(r => {return r.qState==="S";}).map(r => r.qText);
      srcField2.OnData.bind(listener2(selectedValues1));
      srcField1.OnData.unbind(listener1);
    };
    srcField1.OnData.bind(listener1);
  }

  destroy(qlikObj) {
    qlikObj.forEach(obj => {
      if (obj && obj.id) {
        this.app.destroySessionObject(obj.id);
      }
    });
  }
}