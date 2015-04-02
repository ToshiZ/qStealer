'use strict';
angular.module('TotalTablesApp')
	.controller('JoinerController', ['$scope', '$localStorage', 'MongoTables', '$http', function($scope, $localStorage, MongoTables, $http){
        $scope.$storage = $localStorage;
        $scope.tables = $localStorage.tables;
        $scope.getAllTours = function(){
            $scope.allTours = [];
            $scope.totals = {};
            for(var t in $scope.$storage.tables){
                for(var g in $scope.$storage.tables[t].games){
                    for(var tour in $scope.$storage.tables[t].games[g].tours){
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
                            if($scope.$storage.tables[t].games[g].tours[tour][0] + 
                                $scope.$storage.tables[t].games[g].tours[tour][1] > 2){
                                $scope.totals[tour].bigger2++;
                                if($scope.totals[tour].lastBigger){
                                    $scope.totals[tour].blockBigger++;
                                    if($scope.totals[tour].allBlocksBigger
                                        .hasOwnProperty($scope.totals[tour].blockBigger)){
                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
                                    }else if($scope.totals[tour].blockBigger != 0){
                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
                                    }
                                }else{
                                    $scope.totals[tour].lastBigger = true;
                                    $scope.totals[tour].lastLess = false;
                                    $scope.totals[tour].blockLess = 0;
                                }
                            }else if($scope.$storage.tables[t].games[g].tours[tour][0] + 
                                        $scope.$storage.tables[t].games[g].tours[tour][1] <= 2){
                                $scope.totals[tour].less2++;
                                if($scope.totals[tour].lastLess){
                                    $scope.totals[tour].blockLess++;
                                    if($scope.totals[tour].allBlocksLess
                                        .hasOwnProperty($scope.totals[tour].blockLess)){
                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
                                    }else if($scope.totals[tour].blockLess != 0){
                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
                                    }
                                }else{
                                    $scope.totals[tour].lastLess = true;
                                    $scope.totals[tour].lastBigger = false;
                                    $scope.totals[tour].blockBigger = 0;
                                }
                            }
                    }
                }
            }
            $scope.allTours.sort(function(a,b){
                return new Date(a) - new Date(b);
            });
        };
//        $scope.getTotals = function(){
//            alert(123);
//            $scope.totals = {};
//            for(var t in $scope.$storage.tables){
//                for(var g in $scope.$storage.tables[t].games){
//                    for(var tour in $scope.$storage.tables[t].games[g].tours){
//                        if(!$scope.totals.hasOwnProperty(tour)){
//                                $scope.totals[tour] = {};
//                                $scope.totals[tour]['bigger2'] = 0;
//                                $scope.totals[tour]['less2'] = 0;
//                                $scope.totals[tour]['lastLess'] = false;
//                                $scope.totals[tour]['lastBigger'] = false;
//                                $scope.totals[tour]['blockBigger'] = 0;
//                                $scope.totals[tour]['blockLess'] = 0;
//                                $scope.totals[tour]['allBlocksBigger'] = {};
//                                $scope.totals[tour]['allBlocksLess'] = {};
//                            }
//                            if($scope.$storage.tables[t].games[g].tours[tour][0] + 
//                                $scope.$storage.tables[t].games[g].tours[tour][1] > 2){
//                                $scope.totals[tour].bigger2++;
//                                if($scope.totals[tour].lastBigger){
//                                    $scope.totals[tour].blockBigger++;
//                                    if($scope.totals[tour].allBlocksBigger
//                                        .hasOwnProperty($scope.totals[tour].blockBigger)){
//                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
//                                    }else if($scope.totals[tour].blockBigger != 0){
//                                        $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
//                                    }
//                                }else{
//                                    $scope.totals[tour].lastBigger = true;
//                                    $scope.totals[tour].lastLess = false;
//                                    $scope.totals[tour].blockLess = 0;
//                                }
//                            }else if($scope.$storage.tables[t].games[g].tours[tour][0] + 
//                                        $scope.$storage.tables[t].games[g].tours[tour][1] <= 2){
//                                $scope.totals[tour].less2++;
//                                if($scope.totals[tour].lastLess){
//                                    $scope.totals[tour].blockLess++;
//                                    if($scope.totals[tour].allBlocksLess
//                                        .hasOwnProperty($scope.totals[tour].blockLess)){
//                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
//                                    }else if($scope.totals[tour].blockLess != 0){
//                                        $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
//                                    }
//                                }else{
//                                    $scope.totals[tour].lastLess = true;
//                                    $scope.totals[tour].lastBigger = false;
//                                    $scope.totals[tour].blockBigger = 0;
//                                }
//                            }
//                    }
//                }
//            }
//        };
        $scope.options = {
            dragStop: function(sourceNodeScope, elements, placeholder, drag, pos){
                alert(1233);
                $scope.getTotals();
            }
        };
         $scope.saveToCloud = function (year) {
            $http.put('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/' + 
                   year + '?apiKey=4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
              { 
                year: year,
                tables: $scope.tables
              }).success(function (data, status, headers, config) {
                
              }).error(function (data, status, headers, config) { alert(status) });
        };
	}]);