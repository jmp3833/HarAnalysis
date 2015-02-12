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
        controllerAs: 'list',
        edit: {
          templateUrl: 'scripts/widgets/har-analysis/edit.html',
          reload: false,
          controller: 'harListEditCtrl'
        }
      });
  }).factory('HarListService',['$http', function($http){
        return {
            getHarList: function() {
                return $http.get('http://localhost:3000/api/get-harfile-set').
                    success(function (data) {
                        return data;
                    }).
                    error(function () {
                        return "error";
                    });
            }
        }
    }])
    .controller('harListCtrl', function($scope, config, HarListService){
        var harListPromise = HarListService.getHarList();
        harListPromise.then(function(result){
            config.files = result.data;
        })
  }).controller('harListEditCtrl', function($scope){
  });
