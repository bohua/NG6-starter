class ComparaisonsPageController {
  /**
 * @param {qlikService} qlikService
 * @param {utilService} utilService
 * @param {stateService} stateService
 */
  constructor(qlikService, utilService, stateService) {
    'ngInject';

    this.qlikService = qlikService;
    this.utilService = utilService;
    this.stateService = stateService;

    this.showRightMenu = false;
    this.showCostStack = false;

    this.qlikObj = {
      'ecart': {
        '#': null,
        '%': null,
        'table': null,
      }
      ,'kpi': {
        '#': null,
        '%': null,
        'table': null
      }
      ,'dist': {
        '#': null,
        '%': null,
        'table': null,
        'legend': null
      }
      ,'dist-cost': {
        '#': null,
        '%': null,
        'legend': null
      }
    };
  }

  $onInit() {
    //Setup state
    this.viewMode = this.stateService.getState('viewMode');
    this.tableMode = this.stateService.getState('tableMode');
    this.refType = this.utilService.getTypeByValue(this.stateService.getState('refType'), this.config.refTypes);

    let stackMode = this.stackMode = this.stateService.getState('stackMode');
    if (stackMode === '$') { stackMode = '%' }
    this.stackMode = stackMode;
    this.kpiChartMode = '#';
    this.ecartChartMode = '#';

    this.topTableTitle = '';
    this.midTableTitle = '';
    this.botTableTitle = 'Écarts';

    //calculate chart sizes
    let resizer = () => {
      let windowHeight = $(window).height(), offset = 493;
      let pageHeight = (windowHeight - offset);
      pageHeight = pageHeight < 500 ? 500 : pageHeight;

      //Écarts table
      $('#QV01a').css("height", pageHeight + 197);
      $('#QV01b').css("height", pageHeight + 197);
      //KPI compare chart
      $('#QV02a').css("height", pageHeight * 0.5);
      //$('#QV02b').css("height", pageHeight * 0.5);
      //Distribution stack chart
      $('#QV03a').css("height", pageHeight * 0.5);
      $('#QV03b').css("height", pageHeight * 0.5);
      $('#QV04a').css("height", pageHeight * 0.5);
      $('#QV04b').css("height", pageHeight * 0.5);
      //$('#QV05').css("height", pageHeight + 97);
    }

    resizer();
    $(window).resize(resizer);

    //Create charts
    this.qlikService.getVisualization("QV02a", this.config["comparaisons-kpi-#chart"]).then(obj => this.qlikObj['kpi']['#'] = obj);
    //this.qlikService.getVisualization("QV02b", this.config["comparaisons-kpi-%chart"]).then(obj => this.qlikObj['kpi']['%'] = obj);
    this.qlikService.getVisualization("QV03a", this.config["comparaisons-distribution-#-chart"]).then(obj => this.qlikObj['dist']['#'] = obj);
    this.qlikService.getVisualization("QV03b", this.config["comparaisons-distribution-#-chart-cost"]).then(obj => this.qlikObj['dist-cost']['#'] = obj);
    this.qlikService.getVisualization("QV04a", this.config["comparaisons-distribution-%-chart"]).then(obj => this.qlikObj['dist']['%'] = obj);
    this.qlikService.getVisualization("QV04b", this.config["comparaisons-distribution-%-chart-cost"]).then(obj => this.qlikObj['dist-cost']['%'] = obj);

    this.qlikService.getVisualization("CurrentSelections", "CurrentSelections");

    //Setup Écarts # table
    this.qlikService.bindVisualizationData(this.config["comparaisons-ecart-#table"], cube => {

      let data = cube.qHyperCube.qDataPages[0].qMatrix;
      let measures = cube.qHyperCube.qMeasureInfo.filter(measure => measure.qFallbackTitle);

      let ecartTableHeader = [];
      let ecartTableData = {};

      data.forEach(row => {
        row.forEach((cell, index) => {
          if (index > 0) {
            let key = measures[index - 1].qFallbackTitle;

            if (key) {
              if (!ecartTableData[key]) {
                ecartTableData[key] = [];
              }
              ecartTableData[key].push(cell.qText);
            }
          } else {
            //Otherwise it's group name
            ecartTableHeader.push(cell.qText);
          }
        });
      });

      this.ecartTableHeader = ecartTableHeader;
      this.ecartTableData = Object.keys(ecartTableData).map(key => [key, ...ecartTableData[key]]);

    }).then(object => this.qlikObj['ecart']['#'] = object);
    
    //Setup Écarts % table
    this.qlikService.bindVisualizationData(this.config["comparaisons-ecart-%table"], cube => {

      let data = cube.qHyperCube.qDataPages[0].qMatrix;
      let measures = cube.qHyperCube.qMeasureInfo.filter(measure => measure.qFallbackTitle);

      let ecartTableHeaderPercent = [];
      let ecartTableDataPercent = {};

      data.forEach(row => {
        row.forEach((cell, index) => {
          if (index > 0) {
            let key = measures[index - 1].qFallbackTitle;

            if (key) {
              if (!ecartTableData[key]) {
                ecartTableDataPercent[key] = [];
              }
              ecartTableDataPercent[key].push(cell.qText);
            }
          } else {
            //Otherwise it's group name
            ecartTableHeaderPercent.push(cell.qText);
          }
        });
      });

      this.ecartTableHeaderPercent = ecartTableHeaderPercent;
      this.ecartTableDataPercent = Object.keys(ecartTableDataPercent).map(key => [key, ...ecartTableDataPercent[key]]);

    }).then(object => this.qlikObj['ecart']['%'] = object);

    //Table view data
    this.qlikService.bindVisualizationData(this.config["comparaisons-table-ecart"], cube => {
      let data = cube.qHyperCube.qDataPages[0].qMatrix;
      this.tableData = data.map(row => (row.map(cell => cell.qText)));

      let totals = ["Grand Total"];
      this.tableTotalRow = totals.concat(cube.qHyperCube.qGrandTotalRow.map(cell => cell.qText));

      let headers = [];
      cube.qHyperCube.qDimensionInfo.map(dimension => {
        headers.push({
          title: dimension.qFallbackTitle,
          visible: true
        });
      });

      //Determine which fields to be visible in table view according to selected streams
      let visibles = [];
      visibles = visibles.concat(this.utilService.getMeasuresByStreams(this.streams, this.config.measures).map(measure => measure.title));

      cube.qHyperCube.qMeasureInfo.map(measure => {
        let title = measure.qFallbackTitle;
        let visible;

        //Special handling of Coût moyen and Coût médiane
        if (this.refType && (title === 'Coût moyen' || title === 'Coût médiane')) {
          visible = (this.refType.value === 1 && title === 'Coût moyen') || (this.refType.value === 2 && title === 'Coût médiane')
        } else {
          visible = visibles.indexOf(title) > -1;
        }

        headers.push({
          title,
          visible
        });
      });

      this.tableHeaders = headers;
      this.showRightMenu = true;
      this.qlikService.resize();
    }).then(object => this.qlikObj['ecart']['table'] = object);

    //Table view data - Dist
    this.qlikService.bindVisualizationData(this.config["comparaisons-table-dist"], cube => {
      let data = cube.qHyperCube.qDataPages[0].qMatrix;
      this.tableDataStack = data.map(row => (row.map(cell => cell.qText)));

      let totals = ["Grand Total"];
      this.tableTotalRowStack = totals.concat(cube.qHyperCube.qGrandTotalRow.map(cell => cell.qText));

      let headers = [];
      cube.qHyperCube.qDimensionInfo.map(dimension => {
        headers.push({
          title: dimension.qFallbackTitle,
          visible: true
        });
      });

      //Determine which fields to be visible in table view according to selected streams
      let visibles = [];
      visibles = visibles.concat(this.utilService.getMeasuresByStreams(this.streams, this.config.measures).map(measure => measure.title));

      cube.qHyperCube.qMeasureInfo.map(measure => {
        let title = measure.qFallbackTitle;
        let visible;

        //Special handling of Coût moyen and Coût médiane
        if (this.refType && (title === 'Coût moyen' || title === 'Coût médiane')) {
          visible = (this.refType.value === 1 && title === 'Coût moyen') || (this.refType.value === 2 && title === 'Coût médiane')
        } else {
          visible = visibles.indexOf(title) > -1;
        }

        headers.push({
          title,
          visible
        });
      });

      this.tableHeadersStack = headers;
      this.showRightMenu = true;
      this.qlikService.resize();
    }).then(object => this.qlikObj['dist']['table'] = object);

    //Table view data - KPI
    this.qlikService.bindVisualizationData(this.config["comparaisons-table-kpi"], cube => {
      let data = cube.qHyperCube.qDataPages[0].qMatrix;
      this.tableDataMeasure = data.map(row => (row.map(cell => cell.qText)));

      let totals = ["Grand Total"];
      this.tableTotalRowMeasure = totals.concat(cube.qHyperCube.qGrandTotalRow.map(cell => cell.qText));

      let headers = [];
      cube.qHyperCube.qDimensionInfo.map(dimension => {
        headers.push({
          title: dimension.qFallbackTitle,
          visible: true
        });
      });

      //Determine which fields to be visible in table view according to selected streams
      let visibles = [];
      visibles = visibles.concat(this.utilService.getMeasuresByStreams(this.streams, this.config.measures).map(measure => measure.title));

      cube.qHyperCube.qMeasureInfo.map(measure => {
        let title = measure.qFallbackTitle;
        let visible;

        //Special handling of Coût moyen and Coût médiane
        if (this.refType && (title === 'Coût moyen' || title === 'Coût médiane')) {
          visible = (this.refType.value === 1 && title === 'Coût moyen') || (this.refType.value === 2 && title === 'Coût médiane')
        } else {
          visible = visibles.indexOf(title) > -1;
        }

        headers.push({
          title,
          visible
        });
      });

      this.tableHeadersMeasure = headers;
      this.showRightMenu = true;
      this.qlikService.resize();
    }).then(object => this.qlikObj['kpi']['table']);

    //Bind legend values to stack bar chart
    this.qlikService.bindVisualizationData(this.config["etalonnage-sub-chart-legend"], cube => {
      let data = cube.qHyperCube.qDataPages[0].qMatrix;

      this.legendList = data.map(row => ({
        value: row[0].qText,
        color: row[1].qText
      }));
      this.legendField = cube.qHyperCube.qDimensionInfo[0].qFallbackTitle;
    }).then(object => this.qlikObj['dist']['legend'] = object);

    //Bind legend values to stack bar chart for Type de coût
    this.qlikService.bindVisualizationData(this.config["etalonnage-cost-chart-legend"], cube => {
      let data = cube.qHyperCube.qDataPages[0].qMatrix;

      this.legendList2 = data.map(row => ({
        value: row[0].qText,
        color: row[1].qText
      }));
      this.legendField2 = cube.qHyperCube.qDimensionInfo[0].qFallbackTitle;
    }).then(object => this.qlikObj['dist-cost']['legend'] = object);


  }

  exportData(chartName, mode) {
    console.log('export ' + chartName + ', ' + mode);
    if(chartName in this.qlikObj && mode in this.qlikObj[chartName]) {
      this.qlikService.exportData(this.qlikObj[chartName][mode]);
    } else {
      console.error('can not find qlik obj');
    }
  }

  setEcartChartMode(mode) {
    this.ecartChartMode = mode;
    this.qlikService.resize();
  }

  setChartView() {
    this.viewMode = this.stateService.setState('viewMode', 'chart');
    this.qlikService.resize();
  }
  setTableView() {
    this.viewMode = this.stateService.setState('viewMode', 'table');
  }

  setStackMode(mode) {
    this.qlikService.setVariable(this.config["stack-mode-variable"], mode)
      .then(() => {
        this.stackMode = this.stateService.setState('stackMode', mode);
        this.qlikService.resize();
      });
  }

  //Setup change listener from control tab [Right tab]
  onStreamChanged(streams) {
    this.streams = streams;
    // qlikService.select(this.config["stream-field"], [stream.value]);
    // qlikService.select(this.config["stream-field"], [stream.value], "GrRef");
    // qlikService.select(this.config["stream-field"], [stream.value], "GrComp");
  }

  onMeasureChanged(measure) {
    this.qlikService.select(this.config["measure-field"], [measure.value]);
    this.qlikService.select(this.config["measure-field"], [measure.value], "GrRef");
    this.qlikService.select(this.config["measure-field"], [measure.value], "GrComp");
  }

  onDimensionChanged(dimension) {
    this.qlikService.select(this.config["dimension-field"], [dimension.value]);
    this.qlikService.select(this.config["dimension-field"], [dimension.value], "GrRef");
    this.qlikService.select(this.config["dimension-field"], [dimension.value], "GrComp");
    this.topTableTitle = dimension.id === 1 ? 'Establishments in Reference Group' : 'Installations in Reference Group';
    this.midTableTitle = dimension.id === 1 ? 'Establishments in Comparative Group' : 'Installations in Comparative Group';
  }

  onStackChanged(stack) {
    this.showCostStack = stack.value === "Type de coûts";

    let value;
    if (stack.value === "Groupes d’âge normaux") {
      value = this.stateService.getState('ageMode').title;
    } else {
      value = stack.value;
    }

    this.qlikService.select(this.config["stack-field"], [value]);
  }

  onRefTypeChanged(refType) {
    this.refType = refType;
    this.qlikService.setVariable(this.config["ref-type-variable"], refType.value)
      .then(() => this.stateService.setState('refType', refType.value));
  }

  onCostTypeChanged(costType) {
    this.costType = costType;
    this.qlikService.setVariable(this.config["cost-type-variable"], costType.value)
      .then(() => this.stateService.setState('costType', costType.value));
  }

  $onDestroy() {
    //console.log('comparaisonsPage component Destroyed');
    let objArray = [];
    for(const [k1, v1] of Object.entries(this.qlikObj)) {
      for(const [k2, v2] of Object.entries(v1)) {
        if(v2) objArray.push(v2);
      }
    }
    this.qlikService.destroy(objArray);
  }
}

export default ComparaisonsPageController;
