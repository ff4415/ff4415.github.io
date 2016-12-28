$(function() {
    var chart;
    $.when(
        $.getJSON("/assets/data/top-500-city-in-Indian/city_number_Of_State.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/literacy_rate_total_of_states.json")
    ).done(function(city_number_Of_state,literacy_rate_total_of_states){
        city_number_Of_state = city_number_Of_state[2]['responseJSON'];
        literacy_rate_total_of_states = literacy_rate_total_of_states[2]['responseJSON'];

        // Initiate the chart
        chart = Highcharts.mapChart('container', {

            title: {
                text: 'Top 500 cities in Indian'
            },

            subtitle: {
                text: 'state by numbers of city ',
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
                headerFormat: '<span style="font-size:10px">{series.name}:</span><br/>',
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
                name: 'numbers_of_city_in_the_state',
                data: city_number_Of_state,
                mapData: Highcharts.maps['countries/in/custom/in-all-andaman-and-nicobar'],
                joinBy: 'woe-name',
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                }
            }],

            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: 'show state by numbers of city ',
                            onclick: function () {
                                chart.update({
                                    subtitle: {
                                        text: 'state by numbers of city',
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

                                        series:[{
                                            name: 'numbers_of_city_in_the_state',
                                            data: city_number_Of_state,
                                            mapdata: Highcharts.maps['countries/in/custom/in-all-andaman-and-nicobar'],
                                            joinby: 'woe-name',
                                            states: {
                                                hover: {
                                                    color: '#a4edba'
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'none',
                                                borderWidth: 0,
                                                shadow: false,
                                                padding: 0,
                                                headerFormat: '<span style="font-size:10px">{series.name}:</span><br/>',
                                                pointFormat: '{point.name}: <b>{point.value} cities</b><br/>',
                                                footerFormat: '<span style="font-size:10px">Source: kaggle.com by ArijitMukherjee </span><br/>',
                                                positioner: function() {
                                                    return {
                                                        x: 480,
                                                        y: 300
                                                    };
                                                }
                                            }
                                        }],
                                    });
                                    chart.colorAxis[0].update({
                                        min: 1,
                                        max: 70,
                                        type: 'linear',
                                        maxColor: '#003399'
                                    });
                                }
                            }, {
                                text: 'show state by literacy_rate_total',
                                onclick: function () {
                                    chart.update({
                                        subtitle: {
                                            text: 'state by literacy_rate_total',
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
                                            series :[{
                                                name: 'numbers of city in the state',
                                                data: literacy_rate_total_of_states,
                                                mapdata: Highcharts.maps['countries/in/custom/in-all-andaman-and-nicobar'],
                                                joinby: 'woe-name',
                                                states: {
                                                    hover: {
                                                        color: '#a4edba'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'none',
                                                    borderWidth: 0,
                                                    shadow: false,
                                                    padding: 0,
                                                    headerFormat: '<span style="font-size:10px">literacy_rate_total_of_states:</span><br/>',
                                                    pointFormat: '{point.name}: <b>{point.value:.3f}</b>  total<br/>',
                                                    footerFormat: '<span style="font-size:10px">Source: kaggle.com by ArijitMukherjee </span><br/>',
                                                    positioner: function() {
                                                        return {
                                                            x: 480,
                                                            y: 300
                                                        };
                                                    }
                                                }
                                            }]
                                        });
                                        chart.colorAxis[0].update({
                                            min: 60,
                                            max: 100,
                                            type: 'linear',
                                            maxColor: '#004d00'
                                        });
                                    },
                                    separator: false
                                }]
                            }
                        }
                    }
                });
            });
        });
