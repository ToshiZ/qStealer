'use strict';
angular.module('TotalTablesApp')
	.controller('JoinerController', ['$scope', '$localStorage', 'MongoTables', '$http', 'Notification', '$filter', function($scope, $localStorage, MongoTables, $http, Notification, $filter){
        $scope.getAllTours = function(){
            $scope.changed = false;
            //$scope.allTours = [];
            $scope.$storage = $localStorage;
            if($scope.$storage.currentYear){
                $scope.tablesByYear = $filter('getByYear')($scope.$storage.mongoTabs, $scope.$storage.currentYear).tables;
            }else{
                Notification.error('Не выбран год.');
            }   
            $scope.refreshTotals();
        };
        $scope.refreshTotals = function(){            
            $scope.allTours = [];
            $scope.totals = {};
            // for(var t in $scope.tablesByYear){
            //     for(var g in $scope.tablesByYear[t].games){
            //         for(var tour in $scope.tablesByYear[t].games[g].tours){
            //             if($scope.allTours.indexOf(tour) == -1)
            //                 $scope.allTours.push(tour);
            //             if(!$scope.totals.hasOwnProperty(tour)){
            //                     $scope.totals[tour] = {};
            //                     $scope.totals[tour]['bigger2'] = 0;
            //                     $scope.totals[tour]['less2'] = 0;
            //                     $scope.totals[tour]['lastLess'] = false;
            //                     $scope.totals[tour]['lastBigger'] = false;
            //                     $scope.totals[tour]['blockBigger'] = 0;
            //                     $scope.totals[tour]['blockLess'] = 0;
            //                     $scope.totals[tour]['allBlocksBigger'] = {};
            //                     $scope.totals[tour]['allBlocksLess'] = {};
            //                 }
            //             if(!$scope.tablesByYear[t].games[g].tours[tour].clicked){
            //                 if($scope.tablesByYear[t].games[g].tours[tour][0] + 
            //                     $scope.tablesByYear[t].games[g].tours[tour][1] > 2){
            //                     $scope.totals[tour].bigger2++;
            //                     if($scope.totals[tour].lastBigger){
            //                         $scope.totals[tour].blockBigger++;
            //                         ////
            //                     }else{
            //                         $scope.totals[tour].lastBigger = true;
            //                         $scope.totals[tour].lastLess = false;
            //                         if($scope.totals[tour].allBlocksLess
            //                             .hasOwnProperty($scope.totals[tour].blockLess)){
            //                             $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
            //                         }else if($scope.totals[tour].blockLess != 0){
            //                             $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
            //                         }
            //                         $scope.totals[tour].blockLess = 0;
            //                     }
            //                 }else if($scope.tablesByYear[t].games[g].tours[tour][0] + 
            //                             $scope.tablesByYear[t].games[g].tours[tour][1] <= 2){
            //                     $scope.totals[tour].less2++;
            //                     if($scope.totals[tour].lastLess){
            //                         $scope.totals[tour].blockLess++;
            //                         /////
            //                     }else{
            //                         $scope.totals[tour].lastLess = true;
            //                         $scope.totals[tour].lastBigger = false;
            //                         if($scope.totals[tour].allBlocksBigger
            //                             .hasOwnProperty($scope.totals[tour].blockBigger)){
            //                             $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
            //                         }else if($scope.totals[tour].blockBigger != 0){
            //                             $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
            //                         }
            //                         $scope.totals[tour].blockBigger = 0;
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
            // for(var tour in $scope.totals){
            //     if($scope.totals[tour].allBlocksBigger
            //         .hasOwnProperty($scope.totals[tour].blockBigger)){
            //         $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger]++;
            //     }else if($scope.totals[tour].blockBigger != 0){
            //         $scope.totals[tour].allBlocksBigger[$scope.totals[tour].blockBigger] = 1;
            //     }
            //     $scope.totals[tour].blockBigger = 0;
            //     if($scope.totals[tour].allBlocksLess
            //         .hasOwnProperty($scope.totals[tour].blockLess)){
            //         $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess]++;
            //     }else if($scope.totals[tour].blockLess != 0){
            //         $scope.totals[tour].allBlocksLess[$scope.totals[tour].blockLess] = 1;
            //     }
            //     $scope.totals[tour].blockLess = 0;                
            // }
            $scope.findBlocks($scope.tablesByYear, $scope.totals);
            $scope.allTours.sort(function(a,b){
                return new Date(a) - new Date(b);
            });
        };
        $scope.findBlocks = function(tab, totalsVar){
              for(var t in tab){
                for(var g in tab[t].games){
                    for(var tour in tab[t].games[g].tours){
                        if($scope.allTours.indexOf(tour) == -1)
                            $scope.allTours.push(tour);
                        if(!totalsVar.hasOwnProperty(tour)){
                                totalsVar[tour] = {};
                                totalsVar[tour]['bigger2'] = 0;
                                totalsVar[tour]['less2'] = 0;
                                totalsVar[tour]['lastLess'] = false;
                                totalsVar[tour]['lastBigger'] = false;
                                totalsVar[tour]['blockBigger'] = 0;
                                totalsVar[tour]['blockLess'] = 0;
                                totalsVar[tour]['allBlocksBigger'] = {};
                                totalsVar[tour]['allBlocksLess'] = {};
                            }
                        if(!tab[t].games[g].tours[tour].clicked){
                            if(tab[t].games[g].tours[tour][0] + 
                                tab[t].games[g].tours[tour][1] > 2){
                                totalsVar[tour].bigger2++;
                                if(totalsVar[tour].lastBigger){
                                    totalsVar[tour].blockBigger++;
                                    ////
                                }else{
                                    totalsVar[tour].lastBigger = true;
                                    totalsVar[tour].lastLess = false;
                                    if(totalsVar[tour].allBlocksLess
                                        .hasOwnProperty(totalsVar[tour].blockLess)){
                                        totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess]++;
                                    }else if(totalsVar[tour].blockLess != 0){
                                        totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess] = 1;
                                    }
                                    totalsVar[tour].blockLess = 0;
                                }
                            }else if(tab[t].games[g].tours[tour][0] + 
                                        tab[t].games[g].tours[tour][1] <= 2){
                                totalsVar[tour].less2++;
                                if(totalsVar[tour].lastLess){
                                    totalsVar[tour].blockLess++;
                                    /////
                                }else{
                                    totalsVar[tour].lastLess = true;
                                    totalsVar[tour].lastBigger = false;
                                    if(totalsVar[tour].allBlocksBigger
                                        .hasOwnProperty(totalsVar[tour].blockBigger)){
                                        totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger]++;
                                    }else if(totalsVar[tour].blockBigger != 0){
                                        totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger] = 1;
                                    }
                                    totalsVar[tour].blockBigger = 0;
                                }
                            }
                        }
                    }
                }
            }
            for(var tour in totalsVar){
                if(totalsVar[tour].allBlocksBigger
                    .hasOwnProperty(totalsVar[tour].blockBigger)){
                    totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger]++;
                }else if(totalsVar[tour].blockBigger != 0){
                    totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger] = 1;
                }
                totalsVar[tour].blockBigger = 0;
                if($scope.totals[tour].allBlocksLess
                    .hasOwnProperty(totalsVar[tour].blockLess)){
                    totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess]++;
                }else if(totalsVar[tour].blockLess != 0){
                    totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess] = 1;
                }
                totalsVar[tour].blockLess = 0;                
            }
        };
        $scope.dragStop = function(){
            $scope.changed = true;
            $scope.refreshTotals();
            //$scope.$apply();
        };
        $scope.strToDate = function(str){
            var d = new Date(str);
            return (d.getDate()) + '/' + (d.getMonth() + 1); 
        };
        $scope.getInt = function(t){
            return parseInt(t);
        }; 
        $scope.saveToCloud = function (year) {
            if($scope.$storage.currentYear){
                if($scope.changed){
                    $scope.tablesByYear.updateAt = new Date();
                    $http.put('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/' + 
                           year + '?apiKey=4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
                        { 
                        year: year,
                        updateAt: $scope.tablesByYear.updateAt,
                        tables: $scope.$storage.tables
                        }).success(function (data, status, headers, config) {
                             Notification.info({message: 'Сохранен в облако.', title: year});
                             $scope.changed = false;
                        }).error(function (data, status, headers, config) { 
                            Notification.error({message: status, title: year});
                        });
                    }
                }
        };
        $scope.selectTour = function(tour){
            $scope.selectedTour = tour;
        };
        $scope.orderVariants = function(){
            var allTabs = $scope.tablesByYear.slice();
        };
        $scope.$on("$destroy", function(){
            $scope.saveToCloud($scope.$storage.currentYear);
        });       
}]);