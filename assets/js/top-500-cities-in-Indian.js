$(function() {

  var cities_of_state = [{
    "woe-name": "Uttar Pradesh",
    "value": 63
  }, {
    "woe-name": "West Bengal",
    "value": 61
  }, {
    "woe-name": "Maharashtra",
    "value": 44
  }, {
    "woe-name": "Andhra Pradesh",
    "value": 42
  }, {
    "woe-name": "Tamil Nadu",
    "value": 32
  }, {
    "woe-name": "Madhya Pradesh",
    "value": 32
  }, {
    "woe-name": "Gujarat",
    "value": 29
  }, {
    "woe-name": "Rajasthan",
    "value": 29
  }, {
    "woe-name": "Bihar",
    "value": 27
  }, {
    "woe-name": "Karnataka",
    "value": 26
  }, {
    "woe-name": "Haryana",
    "value": 20
  }, {
    "woe-name": "Punjab",
    "value": 16
  }, {
    "woe-name": "Delhi",
    "value": 15
  }, {
    "woe-name": "Jharkhand",
    "value": 10
  }, {
    "woe-name": "Orissa",
    "value": 10
  }, {
    "woe-name": "Chhattisgarh",
    "value": 9
  }, {
    "woe-name": "Kerala",
    "value": 7
  }, {
    "woe-name": "Uttarakhand",
    "value": 6
  }, {
    "woe-name": "Assam",
    "value": 4
  }, {
    "woe-name": "Jammu and Kashmir",
    "value": 3
  }, {
    "woe-name": "Puducherry",
    "value": 2
  }, {
    "woe-name": "Meghalaya",
    "value": 1
  }, {
    "woe-name": "Nagaland",
    "value": 1
  }, {
    "woe-name": "Tripura",
    "value": 1
  }, {
    "woe-name": "Himachal Pradesh",
    "value": 1
  }, {
    "woe-name": "Uttaranchal",
    "value": 1
  }, {
    "woe-name": "Manipur",
    "value": 1
  }, {
    "woe-name": "Andaman and Nicobar",
    "value": 1
  }, {
    "woe-name": "Mizoram",
    "value": 1
  }];

  // Initiate the chart
  Highcharts.mapChart('container', {

    title: {
      text: 'State by number of cities'
    },

    legend: {
      layout: 'vertical',
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.85)',
      floating: true,
      verticalAlign: 'middle',
      align: 'right',
      x: -50,
      y: 100,
    },
    tooltip: {
      backgroundColor: 'none',
      borderWidth: 0,
      shadow: false,
      padding: 0,
      headerFormat: '<span style="font-size:10px">number of cities:</span><br/>',
      pointFormat: '{point.name}: <b>{point.value} cities</b><br/>',
      footerFormat: '<span style="font-size:10px">Source: kaggle.com by ArijitMukherjee </span><br/>',
      positioner: function() {
        return {
          x: 480,
          y: 300
        };
      }
    },

    colorAxis: {
      min: 1,
      max: 70,
      type: 'linear'
    },

    series: [{
      data: cities_of_state,
      mapData: Highcharts.maps['countries/in/custom/in-all-andaman-and-nicobar'],
      joinBy: 'woe-name',
      states: {
        hover: {
          color: '#a4edba'
        }
      }
    }]
  });
});
