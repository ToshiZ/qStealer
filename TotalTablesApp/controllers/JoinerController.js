'use strict';
angular.module('TotalTablesApp')
	.controller('JoinerController', ['$scope', '$localStorage', 'MongoTables', '$http', 'Notification', '$filter', '$location', '$anchorScroll', function($scope, $localStorage, MongoTables, $http, Notification, $filter, $location, $anchorScroll){
        $scope.getAllTours = function(){
            $scope.changed = false;
            $scope.$storage = $localStorage;
            $scope.findQuery = {allBlocksBigger: {}, allBlocksLess: {}};
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
            $scope.names = {};  
            for(var t in $scope.tablesByYear)
                $scope.names[t] = $scope.tablesByYear[t].country;
            $scope.findBlocks($scope.tablesByYear, $scope.totals);
            $scope.allTours.sort(function(a,b){
                return new Date(a) - new Date(b);
            });
        };
        $scope.findBlocks = function(tab, totalsVar, combination){
            var iters = [];
            if(combination)
                iters = combination;
            else
                for(var i in tab)
                    iters[i] = i;
            for(var t = 0; t < iters.length; t++){
                for(var g in tab[iters[t]].games){
                    for(var tour in tab[iters[t]].games[g].tours){
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
                        if(!tab[iters[t]].games[g].tours[tour].clicked){
                            if(tab[iters[t]].games[g].tours[tour][0] + 
                                tab[iters[t]].games[g].tours[tour][1] > 2){
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
                            }else if(tab[iters[t]].games[g].tours[tour][0] + 
                                        tab[iters[t]].games[g].tours[tour][1] <= 2){
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
            $scope.refreshTotals();
            $scope.changed = true;
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
        $scope.selectResult = function(index){
            //$scope.selectedResult = index;
            var tmp = [];
            for(var t in $scope.tablesByYear){
                tmp[t] = $scope.tablesByYear[$scope.findResults[index][t]];
            }
            $scope.tablesByYear = tmp.slice();
            $location.hash('top');
            $anchorScroll();
        };
        $scope.orderVariants = function(){
            $scope.selectedResult = undefined;
            var allTabs = $scope.tablesByYear.slice();
            var tmp = [];
            $scope.names = {};
            for(var i = 0; i < allTabs.length; i++){
                tmp[i] = i;
                $scope.names[i] = allTabs[i].country;
            }
            var combs = combinations(tmp);
            $scope.findResults = [];
            for(var i = 0; i < combs.length;){
                var totalsVar = {};
                $scope.findBlocks(allTabs, totalsVar, combs[i]);
                if(!$.isEmptyObject(totalsVar[$scope.selectedTour].allBlocksBigger) && $scope.biggerNullBlock){
                    combs.splice(i, 1);
                    continue;
                }
                if(!$.isEmptyObject(totalsVar[$scope.selectedTour].allBlocksLess) && $scope.lessNullBlock){
                    combs.splice(i, 1);
                    continue;
                }
                if(JSON.stringify(totalsVar[$scope.selectedTour].allBlocksBigger) != JSON.stringify($scope.findQuery.allBlocksBigger) && !$.isEmptyObject($scope.findQuery.allBlocksBigger)){
                    combs.splice(i, 1);
                    continue;
                }
                if(JSON.stringify(totalsVar[$scope.selectedTour].allBlocksLess) != JSON.stringify($scope.findQuery.allBlocksLess) &&!$.isEmptyObject($scope.findQuery.allBlocksLess)){
                    combs.splice(i, 1);
                    continue;
                }
                i++;
            }
            $scope.findResults = combs;
        };
        $scope.deleteBiggerBlock = function(block){
            delete $scope.findQuery.allBlocksBigger[block];
        };
        $scope.deleteLessBlock = function(block){
            delete $scope.findQuery.allBlocksLess[block];
        };
        $scope.$watchCollection('tablesByYear', function(newValue, oldValue){
            if(newValue === oldValue)
                return;
            $scope.dragStop();
        });
        $scope.$on("$destroy", function(){
            $scope.saveToCloud($scope.$storage.currentYear);
        });     
        function combinations(arr) {
        if(arr.length >1){
            var beg = arr[0],
                arr1 = combinations(arr.slice(1)),
                arr2 = [],
                l = arr1[0].length;
                for(var i=0; i < arr1.length; i++)
                    for(var j=0; j <= l; j++)
                        arr2.push(arr1[i].slice(0,j).concat(beg, arr1[i].slice(j)));
                return arr2;
        }else return [arr];
    }  
}]);