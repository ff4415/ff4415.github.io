$(function() {
    var H = Highcharts,
        map = H.maps['countries/in/custom/in-all-andaman-and-nicobar'],
        chart;
    $.when(
        $.getJSON("/assets/data/top-500-city-in-Indian/city_number_Of_state.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/literacy_rate_total_of_states.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/female_graduates_of_states.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/total_graduates_of_states.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/city_population.json"),
        $.getJSON("/assets/data/top-500-city-in-Indian/effective_literacy_rate_each_city.json")
    ).done(function(city_number_Of_state,literacy_rate_total_of_states, female_graduates_of_states,total_graduates_of_states,city_population,effective_literacy_rate_each_city){

        city_number_Of_state = city_number_Of_state[2]['responseJSON'];

        literacy_rate_total_of_states = literacy_rate_total_of_states[2]['responseJSON'];

        female_graduates_of_states = female_graduates_of_states[2]['responseJSON'];

        total_graduates_of_states = total_graduates_of_states[2]['responseJSON'];

        var data_city_population = [];
        $.each(city_population[2]['responseJSON'], function() {
            this.z = this.population;
            data_city_population.push(this);
        });

        var data_effective_literacy_rate_each_city = [];
        $.each(effective_literacy_rate_each_city[2]['responseJSON'], function() {
            this.z = this.rank;
            data_effective_literacy_rate_each_city.push(this);
        });
        console.log(effective_literacy_rate_each_city[2]['responseJSON']);


        // Initiate the chart
        chart = Highcharts.mapChart('container', {
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    theme: {
                        fill: 'white',
                        'stroke-width': 1,
                        stroke: 'silver',
                        r: 0,
                        states: {
                            hover: {
                                fill: '#a4edba'
                            },
                            select: {
                                stroke: '#039',
                                fill: '#a4edba'
                            }
                        }
                    },
                    verticalAlign: 'bottom'
                }
            },
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
                mapData: map,
                joinBy: 'woe-name',
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                }
            },{}],

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

                                    series:[{
                                        name: 'numbers_of_city_in_the_state',
                                        data: city_number_Of_state,
                                        mapdata: map,
                                        joinby: 'woe-name',
                                        states: {
                                            hover: {
                                                color: '#a4edba'
                                            }
                                        }
                                    }]
                                });
                                chart.series[1].update({
                                    data: null
                                });                                chart.colorAxis[0].update({
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
                                    },

                                    series :[{
                                        name: 'numbers of city in the state',
                                        data: literacy_rate_total_of_states,
                                        mapdata: map,
                                        joinby: 'woe-name',
                                        states: {
                                            hover: {
                                                color: '#a4edba'
                                            }
                                        }
                                    }]
                                });
                                chart.series[1].update({
                                    data: null
                                });                                chart.colorAxis[0].update({
                                    min: 60,
                                    max: 100,
                                    type: 'linear',
                                    maxColor: '#004d00'
                                });
                            }
                        },  {
                            text: 'show state by female_graduates Percentage',
                            onclick: function () {
                                chart.update({
                                    subtitle: {
                                        text: 'States by female_graduates Percentage in Entire Female Population of cities in Top 500'
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
                                        headerFormat: '<span style="font-size:10px">female_graduates_of_states:</span><br/>',
                                        pointFormat: '{point.name}: <b>{point.value:.3f}</b>  total<br/>',
                                        footerFormat: '<span style="font-size:10px">Source: kaggle.com by ArijitMukherjee </span><br/>',
                                        positioner: function() {
                                            return {
                                                x: 480,
                                                y: 300
                                            };
                                        }
                                    },

                                    series :[{
                                        name: 'female_graduates_of_states',
                                        data: female_graduates_of_states,
                                        mapdata: map,
                                        joinby: 'woe-name',
                                        states: {
                                            hover: {
                                                color: '#a4edba'
                                            }
                                        }
                                    }]
                                });
                                chart.series[1].update({
                                    data: null
                                });
                                chart.colorAxis[0].update({
                                    min: 10,
                                    max: 30,
                                    type: 'linear',
                                    maxColor: '#99004d'
                                });
                            }
                        }, {
                            text: 'show states by total_graduates Percentage',
                            onclick: function () {
                                chart.update({
                                    subtitle: {
                                        text: 'states by total_graduates Percentage in Entire Population of cities in Top 500'
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
                                        headerFormat: '<span style="font-size:10px">total_graduates_of_states:</span><br/>',
                                        pointFormat: '{point.name}: <b>{point.value:.3f}</b>  total<br/>',
                                        footerFormat: '<span style="font-size:10px">Source: kaggle.com by ArijitMukherjee </span><br/>',
                                        positioner: function() {
                                            return {
                                                x: 480,
                                                y: 300
                                            };
                                        }
                                    },

                                    series :[{
                                        name: 'total_graduates_of_states',
                                        type: 'map',
                                        data: total_graduates_of_states,
                                        mapdata: map,
                                        joinby: 'woe-name',
                                        states: {
                                            hover: {
                                                color: '#a4edba'
                                            }
                                        }
                                    }]
                                });
                                chart.series[1].update({
                                    data: null
                                });
                                chart.colorAxis[0].update({
                                    min: 10,
                                    max: 25,
                                    type: 'linear',
                                    maxColor: '#b3b300'
                                });
                            }
                        }, {
                            text: 'show cities by city_population',
                            onclick: function () {
                                chart.series[1].update({
                                    type: 'mapbubble',
                                    name: 'city_population',
                                    data: data_city_population,
                                    maxSize: '12%',
                                    dataLabels: {
                                        enabled: false,
                                        format: '{point.city}'
                                    },
                                    color: H.getOptions().colors[0],
                                    tooltip: {
                                        headerFormat: '<span style="font-size:10px">city_name,state_name:</span><br/>',
                                        pointFormat: '{point.city}, {point.state_name}<br>' +
                                        'Lat: {point.lat}<br>' +
                                        'Lon: {point.lon}<br>' +
                                        'Population: {point.population}<br>'
                                    }
                                    });
                                chart.update({
                                    subtitle: {
                                        text: 'cities by city_population'
                                    },
                                    legend: {
                                        enabled: false,
                                    },
                                    tooltip: {
                                        backgroundColor: ' rgba(247,247,247,0.85)',
                                        padding: 8,
                                        positioner: null
                                    },
                                    series: [{
                                        name: 'Basemap',
                                        mapdata: map,
                                        data: null,
                                        borderColor: '#606060',
                                        nullColor: 'rgba(200, 200, 200, 0.2)',
                                        showInLegend: false

                                    }]
                                });

                            },
                            separator: false
                        }, {
                            text: 'show cities by effective_literacy_rate_each_city',
                            onclick: function () {
                                chart.series[1].update({
                                    type: 'mapbubble',
                                    name: 'effective_literacy_rate_each_city',
                                    data: data_effective_literacy_rate_each_city,
                                    minSize: 1,
                                    maxSize: '12%',
                                    dataLabels: {
                                        enabled: false,
                                        format: '{point.city}'
                                    },
                                    color: H.getOptions().colors[2],
                                    tooltip: {
                                        headerFormat: '<span style="font-size:10px">city_name,state_name:</span><br/>',
                                        pointFormat: '{point.city}, {point.state_name}<br>' +
                                        'Lat: {point.lat}<br>' +
                                        'Lon: {point.lon}<br>' +
                                        'effective_literacy_rate: {point.effective_literacy_rate_total:.3f}% total<br>'
                                    }
                                    });
                                chart.update({
                                    subtitle: {
                                        text: 'cities by effective_literacy_rate_each_city'
                                    },
                                    legend: {
                                        enabled: false,
                                    },
                                    tooltip: {
                                        backgroundColor: ' rgba(247,247,247,0.85)',
                                        padding: 8,
                                        positioner: null
                                    },
                                    series: [{
                                        name: 'Basemap',
                                        mapdata: map,
                                        data: null,
                                        borderColor: '#606060',
                                        nullColor: 'rgba(200, 200, 200, 0.2)',
                                        showInLegend: false

                                    }]
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
