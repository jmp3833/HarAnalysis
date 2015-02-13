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
                    return HarListService.getTestReport(config.test);
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
            getTestReport: function(test){
                if(test == undefined){test = ''}
                return $http.get('http://localhost:3000/api/get-report?dir=./harfiles/' + test).
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
  }).controller('harListEditCtrl', function($scope, testNames, config){
        $scope.testNames = testNames;
  });
