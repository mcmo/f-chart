/* customized from source: http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/stock/demo/compare/ */

var Chart = (function() {
  var seriesOptions = [],
    seriesCounter = 0;
    //names = ['MSFT', 'AAPL'];
    console.log('names', names);

  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */
  function createChart() {

    $('#container').highcharts('StockChart', {

      rangeSelector: {
        selected: 4
      },

      yAxis: {
        labels: {
          formatter: function() {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
          }
        },
        plotLines: [{
          value: 0,
          width: 2,
          color: 'silver'
        }]
      },

      plotOptions: {
        series: {
          compare: 'percent'
        }
      },

      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2
      },

      series: seriesOptions
    });
  }

  var getData = function(names, addSeries) {
    $.each(names, function(i, name) {

      function addZero(num) {
        return num < 10 ? '0' + num : num;
      }

      var url = 'https://query.yahooapis.com/v1/public/yql';
      var startDate = '2015-01-01';
      var end = new Date();
      var endDate = end.getFullYear() + '-' + addZero(end.getMonth() + 1) + '-' + addZero(end.getDate() - 1);
      var data = encodeURIComponent('select Date,Adj_Close from yahoo.finance.historicaldata where symbol in ("' + name + '") and startDate = "' + startDate + '" and endDate = "' + endDate + '"');
      $.getJSON(url, 'q=' + data + "&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json", function(data) {
        var quotes = data.query.results.quote;
        var datePrices = quotes.map(function(d) {
          return [new Date(d.Date).getTime(), +d.Adj_Close];
        });
        seriesOptions[i] = {
          name: name,
          data: datePrices.reverse()
        };
        console.log(seriesOptions[i])

        if (addSeries) {
          var chart = $('#container').highcharts();
          return chart.addSeries(seriesOptions[0]);
        }

        // As we're loading the data asynchronously, we don't know what order it will arrive. So we keep a counter and create the chart when all the data is loaded.
        seriesCounter += 1;
        if (seriesCounter === names.length) {
          createChart();
          spinner.stop();
        }
      }); // getJSON
    });
    seriesCounter = 0;
  }

  function removeSeries(symbol) {
    var chart = $('#container').highcharts();
    chart.series.forEach(function(c) {
      if (c.name === symbol) return c.remove()
    })
  }

  getData(names);

  return {
    getData: getData,
    removeSeries: removeSeries
  };
})();
