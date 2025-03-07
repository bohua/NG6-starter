class StreamBarController {
  /**
 * @param {QlikService} qlikService
 */
  constructor(qlikService) {
    'ngInject';

    let _this = this;
    let streamField;
    let streamFieldListener = () => {
      let streams = [..._this.streams];

      streamField.rows.map((row) => {
        streams.forEach(stream => {
          if (stream.value === row.qText) {
            stream.selected = row.qState === 'S';
          }
        })
      });

      _this.streams = streams;

      _this.onStreamChanged({ streams: streams.filter(stream => stream.selected) });
    };

    _this.$onInit = () => {
      streamField = qlikService.field([_this.qlikField], streamFieldListener);
    };

    _this.selectStream = stream => {
      //_this.stream = stream;

      let selected = _this.streams.filter(s => s.selected);

      //When there's only one option left, don't de-select the last option
      if (selected.length === 1 && selected[0].title === stream.title) {
        return;
      }

      //When selecting Urgence and Amb autres, just do a clear selection
      if (stream.value === "Urgence" || stream.value === "Amb autres") {
        streamField.selectValues([stream.value]);
        qlikService.select(_this.qlikField, [stream.value], "GrRef");
        qlikService.select(_this.qlikField, [stream.value], "GrComp");
      } else {
        //When jumping from Urgence and Amb autres to CD/CDJ, just do a clear selection
        if (selected.length === 1 && selected[0].value === "Urgence" || selected[0].value === "Amb autres") {
          streamField.selectValues([stream.value]);
          qlikService.select(_this.qlikField, [stream.value], "GrRef");
          qlikService.select(_this.qlikField, [stream.value], "GrComp");
        } else {
          //When selecting CD and CDJ, do a toggle selection instead
          streamField.selectValues([stream.value], true);
          qlikService.select(_this.qlikField, [stream.value], "GrRef", true);
          qlikService.select(_this.qlikField, [stream.value], "GrComp", true);
        }
      }
    };

    _this.$onDestroy = () => {
      streamField.OnData.unbind(streamFieldListener);
    };
  }
}

export default StreamBarController;
