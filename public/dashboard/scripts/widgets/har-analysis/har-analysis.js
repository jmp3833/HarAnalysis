/**
 * Controller for widget that displays all directories and
 * HAR samples available for test and analysis
 */

'use strict';

angular.module('sample.widgets.har-analysis', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('har-analysis', {
        title: 'Har Analysis',
        description: 'Shows all harfiles that exist and can be analyzed',
        controller: 'harListCtrl',
        templateUrl: 'scripts/widgets/har-analysis/har-analysis.html',
        reload: true,
        resolve: {
            data: function(HarListService, config){
                if(config.test){
                    return HarListService.getTestReport(config.test, config.threshold);
                }
            }
        },
        edit: {
          templateUrl: 'scripts/widgets/har-analysis/edit.html',
          resolve: {
              testNames: function(HarListService){
                  return HarListService.getTestNames();
              }
          },
          reload: false,
          controller: 'harListEditCtrl'
        }
      });
  }).factory('HarListService',['$http', function($http){
        return {
            getTestReport: function(test, threshold){
                if(test == undefined){test = ''}
                if(threshold == undefined){threshold = '60'}
                return $http.get('http://localhost:3000/api/get-report?dir=./harfiles/' + test + '&threshold=' + threshold).
                    success(function (data) {
                        return data;
                    }).
                    error(function () {
                        return "error";
                    });
            },
            getTestNames: function(){
                return $http.get('http://localhost:3000/api/get-all-tests').
                    success(function (data) {
                        return data;
                    }).
                    error(function () {
                        return "error";
                    });
            }
        }
    }])
    .controller('harListCtrl', function($scope, data, config){
        $scope.data = data;
        $scope.directory = config.test;
        $scope.selectedFile = data.data.files[0];

        $scope.chartConfig = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'HTTP Archive File Scores'
            },
            xAxis: {
                categories: [
                    '0-10',
                    '10-20',
                    '20-30',
                    '30-40',
                    '40-50',
                    '50-60',
                    '60-70',
                    '70-80',
                    '80-90',
                    '90-100',
                ],title: {
                    text: 'Score (0-100)'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of HAR Files'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                type: 'column',
                name: 'Number of HAR files',
                data: data.data.chartData

            }]
        };
  }).controller('harListEditCtrl', function($scope, testNames, config){
        $scope.testNames = testNames;
  });
