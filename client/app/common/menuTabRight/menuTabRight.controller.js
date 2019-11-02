class menuTabRightController {
  /**
* @param {qlikService} qlikService
* @param {utilService} utilService
* @param {stateService} stateService
*/
  constructor(qlikService, utilService, stateService) {
    'ngInject';
    this.name = 'menuTabRight';

    this.qlikService = qlikService;
    this.utilService = utilService;
    this.stateService = stateService;

    this.$onDestroy = () => {
      //console.log('menuTabRight component Destroyed');
      if (this.showCompare) {
        this.refGroupCountModelEstab.Validated.unbind(this.refGroupCountEstabListener);
        this.refGroupCountModelInst.Validated.unbind(this.refGroupCountInstListener);
        this.compGroupCountModelEstab.Validated.unbind(this.compGroupCountEstabListener);
        this.compGroupCountModelInst.Validated.unbind(this.compGroupCountInstListener);
      }

      this.dimensionField.OnData.unbind(this.dimensionFieldListener);
      this.measureField.OnData.unbind(this.measureFieldListener);
      if(this.stackField) {
        this.stackField.OnData.unbind(this.stackFieldListener);
      }
    }
  }



  $onInit() {
    let _this = this;
    let measure = this.stateService.getState('measure');
    let dimension = this.stateService.getState('dimension');
    let stack = this.stateService.getState('stack');

    if (measure) this.measure = measure;
    if (dimension) this.dimension = dimension;
    if (stack) this.stack = stack;

    if (this.showCompare)
      this.qlikService.getVisualization("LIST01a", this.qlikConfig['group-ref-list-estab']).then(model => {
        this.refGroupCountModelEstab = model;
        this.refGroupCountEstab = model.layout.title;

        $('.reference-lists').find('.ref-list').click(function (e) {
          var $this = $(this);

          if ($this.hasClass('active')) {
            if ($(e.target).parents('.ref-dropdown-wrap').length === 0) {
              $this.removeClass('active');
              $this.children('.ref-dropdown').slideUp();
              _this.qlikService.resize();
            }
          } else {
            $('.ref-list').removeClass('active');
            $this.parents().find('.ref-dropdown').slideUp();
            $this.addClass('active');
            $this.children('.ref-dropdown').slideDown();
            _this.qlikService.resize();
          }
        });

        this.refGroupCountEstabListener = () => {
          _this.refGroupCountEstab = model.layout.title;
        };
        model.Validated.bind(this.refGroupCountEstabListener);
      });

    if (this.showCompare)
      this.qlikService.getVisualization("LIST01b", this.qlikConfig['group-ref-list-inst']).then(model => {
        this.refGroupCountModelInst = model;
        this.refGroupCountInst = model.layout.title;

        this.refGroupCountInstListener = () => {
          _this.refGroupCountInst = model.layout.title;
        };

        model.Validated.bind(this.refGroupCountInstListener);
      });

    if (this.showCompare)
      this.qlikService.getVisualization("LIST02a", this.qlikConfig['group-comp-list-estab']).then(model => {
        this.compGroupCountModelEstab = model;
        this.compGroupCountEstab = model.layout.title;

        this.compGroupCountEstabListener = () => {
          _this.compGroupCountEstab = model.layout.title;
        };

        model.Validated.bind(this.compGroupCountEstabListener);
      });

    if (this.showCompare)
      this.qlikService.getVisualization("LIST02b", this.qlikConfig['group-comp-list-inst']).then(model => {
        this.compGroupCountModelInst = model;
        this.compGroupCountInst = model.layout.title;

        this.compGroupCountInstListener = () => {
          _this.compGroupCountInst = model.layout.title;
        };

        model.Validated.bind(this.compGroupCountInstListener);
      });

    this.setDefaultStateIfEmpty('refType', this.qlikConfig.refTypes, true);
    this.selectRefType(this.utilService.getTypeByValue(this.stateService.getState('refType'), this.qlikConfig.refTypes));

    //costType handling
    this.setDefaultStateIfEmpty('costType', this.qlikConfig.costTypes, true);
    this.selectCostType(this.utilService.getTypeByValue(this.stateService.getState('costType'), this.qlikConfig.costTypes));

    //Dimension handling
    this.dimensionFieldListener = () => {
      this.dimensionField.rows.forEach(row => {
        this.qlikConfig.dimensions.forEach(dimension => {
          if (row.qText === dimension.value && row.qState === 'S') {
            this.dimension = dimension;
            this.stateService.setState('dimension', this.dimension);
          }
        });
      });
      this.setDefaultStateIfEmpty('dimension', this.qlikConfig.dimensions, false);
    };
    this.dimensionField = this.qlikService.field([this.qlikConfig["dimension-field"]], this.dimensionFieldListener);
    this.dimensionFieldListener();

    //Measure handling
    this.measureFieldListener = () => {
      this.measureField.rows.forEach(row => {
        this.measures.forEach(measure => {
          if (row.qText === measure.value && row.qState === 'S') {
            this.measure = measure;
            this.stateService.setState('measure', this.measure);
          }
        });
      });
      this.setDefaultStateIfEmpty('measure', this.qlikConfig.measures, false);
      //this.onMeasureChanged({ measure: this.measure });
    };
    this.measureField = this.qlikService.field([this.qlikConfig["measure-field"]], this.measureFieldListener);
    this.measureFieldListener();

    //Stack handling
    this.stackFieldListener = () => {
      this.qlikConfig.stacks.forEach(stack => {
        let selected = false;
        let hits = this.stackField.rows.filter(row => row.qText === stack.value || (stack.alt && stack.alt.indexOf(row.qText) > -1));

        hits.forEach(hit => {
          if (hit.qState === 'S') {
            selected = true;
          }
        });

        if (selected) {
          this.stack = stack;
          this.stateService.setState('stack', this.stack);
        }
      });
      let ret = this.setDefaultStateIfEmpty('stack', this.qlikConfig.stacks, false);
      if(ret) {
        this.selectFilter(ret);
      }
    };
    this.stackField = this.qlikService.field([this.qlikConfig["stack-field"]], this.stackFieldListener);
    this.stackFieldListener();

    let dim = this.stateService.getState('dimension');
    this.setCompDefaults(dim);
  }

  setDefaultStateIfEmpty(prop, propConfigs, onlyValue, cond) {
    let ret = null;
    if(propConfigs.length > 0) {
      if(this.stateService.exists(prop)) {
        let p0 = onlyValue === true ? this.stateService.getState(prop).value : this.stateService.getState(prop).title;
        let found = false;
        for(var p of propConfigs) {
          let p1 = onlyValue === true ? p.value : p.title;
          if(p0 === p1) {
            found = true;
            break;
          }
        }
        if(found === true) {
          return ret;
        }
      }

      if(cond === undefined) {
        cond = t => t.default;
      }
      let defaults = propConfigs.filter(t => {return cond(t)});
      if(defaults.length === 1) {
        ret = onlyValue ? defaults[0].value : defaults[0];
        this.stateService.setState(prop, ret);
      } else {
        console.error("there's error in " + prop + " default value configuration.");
        ret = propConfigs[0];
        this.stateService.setState(prop, ret);
      }
    }
    return ret;
  }

  setCompDefaults(dim) {
    this.setCompDefaultsState(dim, "GrRef");
    this.setCompDefaultsState(dim, "GrComp");
  }

  setCompDefaultsState(dim, stateName) {
    if(this.showCompare) {
      let dimTitle = dim ? dim.title.toUpperCase() : null;
      let fnToTranser = (dimTitle && dimTitle === 'inst'.toUpperCase()) ? 
                        this.qlikConfig["transfer-field-inst"] : this.qlikConfig["transfer-field-etab"];
      let defaultConfig = (dimTitle && dimTitle === 'inst'.toUpperCase()) ?
                        this.qlikConfig["defaults"]["inst"][stateName] : this.qlikConfig["defaults"]["etab"][stateName];

      //check if we need to apply default selection on Ref Group.
      let refSelCallback = (refSelection) => {
        if(refSelection == null || refSelection.length == 0) {
          let defaultSelVariable = defaultConfig["variable"];
          if(defaultSelVariable === undefined) {
            let defaultSelValue = defaultConfig["value"];
            if(defaultSelValue === undefined) {
              console.error('invalid defaults config');
            } else {
              this.qlikService.select(fnToTranser, [defaultSelValue], stateName);
            }
          } else {
            this.qlikService.getVariable(defaultSelVariable, (v) => {
              this.qlikService.select(fnToTranser, [v], stateName); 
            });
          }
        }
      };
      let applyDefaultIfEmpty = () => {  this.qlikService.fieldSelectionV2(fnToTranser, stateName, refSelCallback); };

      this.qlikService.fieldSelectionV2(fnToTranser, "$", 
        (currentSels) => {
          if(currentSels.length > 0) {
            this.qlikService.select(fnToTranser, currentSels, stateName).then(applyDefaultIfEmpty);
          } else {
            applyDefaultIfEmpty();
          }
        }
      );
    }
  }

  $onChanges(changeObj) {
    if (changeObj.streams && changeObj.streams.currentValue) {
      this.measures = this.utilService.getMeasuresByStreams(this.streams, this.qlikConfig.measures);
      let defMeasure = this.setDefaultStateIfEmpty('measure', this.measures, false);
      if(defMeasure) {
        this.selectMeasure(defMeasure);
      }
      this.stacks = this.utilService.getStacksByStreams(this.streams, this.qlikConfig.stacks);
      let defStack = this.setDefaultStateIfEmpty('stack', this.stacks, false);
      if(defStack) {
        this.selectFilter(defStack);
      }
    }
  }

  selectMeasure(measure) {
    this.measure = measure;
    this.stateService.setState('measure', this.measure);
    // if(this.measureField) {
    //   this.measureField.selectValues([measure.value]);
    // }
    this.onMeasureChanged({measure});
  }

  selectFilter(stack) {
    this.stack = stack;
    this.onStackChanged({ stack });
  }

  selectDimension(dimension) {
    this.dimension = dimension;
    this.setCompDefaults(dimension);
    this.onDimensionChanged({ dimension });
  }

  selectRefType(selected) {
    this.refType = selected;
    this.onRefTypeChanged({ refType: this.refType });
    let from = (this.refType.value === 1 ? 'Coût médiane' : 'Coût moyen');
    let to = (this.refType.value === 1 ? 'Coût moyen' : 'Coût médiane');
    this.qlikConfig.measures.forEach(m => {
      if(m.title===from) {
        m.title = to;
      }
    });
  }

  selectCostType(selected) {
    this.costType = selected;
    this.onCostTypeChanged({ costType: this.costType });
    let from = (this.costType.value === 1 ? 'Coût total' : 'Coût total - Direct');
    let to = (this.costType.value === 1 ? 'Coût total - Direct' : 'Coût total');
    this.qlikConfig.measures.forEach(m => {
      if(m.title===from) {
        m.title = to;
      }
    });
  }

  $onDestroy() {
    this.dimensionField.OnData.unbind(this.dimensionFieldListener);
    this.measureField.OnData.unbind(this.measureFieldListener);
    this.stackField.OnData.unbind(this.stackFieldListener);
  }
}

export default menuTabRightController;
