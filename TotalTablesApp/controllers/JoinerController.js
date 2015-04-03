'use strict';
angular.module('TotalTablesApp')
	.controller('JoinerController', ['$scope', '$localStorage', 'MongoTables', '$http', 'Notification', '$filter', function($scope, $localStorage, MongoTables, $http, Notification, $filter){
        $scope.getAllTours = function(){
            $scope.allTours = [];
            $scope.$storage = $localStorage;
            if($scope.$storage.currentYear){
                $scope.tablesByYear = $filter('getByYear')($scope.$storage.mongoTabs, $scope.$storage.currentYear).tables;
            }else{
                Notification.error('Не выбран год.');
            }   
            $scope.refreshTotals();
        };
        $scope.refreshTotals = function(){
            $scope.totals = {};
            for(var t in $scope.tablesByYear){
                for(var g in $scope.tablesByYear[t].games){
                    for(var tour in $scope.tablesByYear[t].games[g].tours){
                        if($scope.allTours.indexOf(tour) == -1)
                            $scope.allTours.push(tour);
                        if(!$scope.totals.hasOwnProperty(tour)){
                                $scope.totals[tour] = {};
                                $scope.totals[tour]['bigger2'] = 0;
                                $scope.totals[tour]['less2'] = 0;
                                $scope.totals[tour]['lastLess'] = false;
                                $scope.totals[tour]['lastBigger'] = false;
                                $scope.totals[tour]['blockBigger'] = 0;
                                $scope.totals[tour]['blockLess'] = 0;
                                $scope.totals[tour]['allBlocksBigger'] = {};
                                $scope.totals[tour]['allBlocksLess'] = {};
                            }
                            if($scope.tablesByYear[t].games[g].tours[tour][0] + 
                                $scope.tablesByYear[t].games[g].tours[tour][1] > 2){
                                $scope.totals[tour].bigger2++;
                                if($scope.totals[tour].lastBigger){
                                    $scope.totals[tour].blockBigger++;
                                    ////
                                }else{
                                    $scope.totals[tour].lastBigger = true;
                                    $scope.totals[tour].lastLess = false;
                                    if($scope.totals[tour].allBlocksLess
                                        .hasOwnProperty($scope.totals[tour].blockLess)){
                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
                                    }else if($scope.totals[tour].blockLess != 0){
                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
                                    }
                                    $scope.totals[tour].blockLess = 0;
                                }
                            }else if($scope.tablesByYear[t].games[g].tours[tour][0] + 
                                        $scope.tablesByYear[t].games[g].tours[tour][1] <= 2){
                                $scope.totals[tour].less2++;
                                if($scope.totals[tour].lastLess){
                                    $scope.totals[tour].blockLess++;
                                    /////
                                }else{
                                    $scope.totals[tour].lastLess = true;
                                    $scope.totals[tour].lastBigger = false;
                                    if($scope.totals[tour].allBlocksBigger
                                        .hasOwnProperty($scope.totals[tour].blockBigger)){
                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
                                    }else if($scope.totals[tour].blockBigger != 0){
                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
                                    }
                                    $scope.totals[tour].blockBigger = 0;
                                }
                            }
                    }
                }
            }
            if($scope.totals[tour].allBlocksBigger
                .hasOwnProperty($scope.totals[tour].blockBigger)){
                $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
            }else if($scope.totals[tour].blockBigger != 0){
                $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
            }
            $scope.totals[tour].blockBigger = 0;
            if($scope.totals[tour].allBlocksLess
                .hasOwnProperty($scope.totals[tour].blockLess)){
                $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
            }else if($scope.totals[tour].blockLess != 0){
                $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
            }
            $scope.totals[tour].blockLess = 0;
            $scope.allTours.sort(function(a,b){
                return new Date(a) - new Date(b);
            });
        };
        $scope.strToDate = function(str){
            var d = new Date(str);
            return (d.getDate()) + '/' + (d.getMonth() + 1); 
        };
        $scope.getInt = function(t){
            return parseInt(t);
        };        
}]);