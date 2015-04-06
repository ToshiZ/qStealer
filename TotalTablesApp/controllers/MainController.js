'use strict';
angular.module('TotalTablesApp')
	.controller('MainController', ['$scope', '$localStorage', 'MongoTables', '$http', '$filter', 'Notification', function($scope, $localStorage, MongoTables, $http, $filter, Notification){
		 $scope.$storage = $localStorage.$default({
           // tables: defaultTabs,
             order: ['england', 'germany', 'italy', 'spain', 'france'],
             translater: {
                 england: 'Англия',
                 germany: 'Германия',
                 italy: 'Италия',
                 spain: 'Испания',
                 france: 'Франция'
             }
        });
        $scope.syncWithMongo = function(){
            MongoTables.query(function(data){
                if($scope.$storage.mongoTabs){
                    for(var d = 0; d < data.length; d++){
                        var find = false;
                        for(var m = 0; m < $scope.$storage.mongoTabs.length; m++){
                            if(data[d]._id == $scope.$storage.mongoTabs[m]._id){
                                find = true;
                                if(new Date(data[d].updateAt) > $scope.$storage.mongoTabs[m].updateAt){
                                    $scope.$storage.mongoTabs[m] = data[d];
                                    Notification.info({message: 'Загружен из облака.', title: data[d]._id});
                                }else if(new Date(data[d].updateAt) < $scope.$storage.mongoTabs[m].updateAt){
                                    $scope.saveToCloud(data[d]._id);
                                }
                            }
                        }
                        if(!find){
                            $scope.$storage.mongoTabs.push(data[d]);
                            Notification.success({message: 'Загружен из облака(новый).', title: data[d]._id});
                        }
                    }
                }else{
                    $scope.$storage.mongoTabs = data;
                }
            });
        };
        $scope.setYear = function(year){
            $scope.$storage.tables = $.grep($scope.$storage.mongoTabs, function(e){ return e._id == year; })[0].tables;
            $scope.$storage.currentYear = year;
        };
        $scope.addYear = function(){
            $scope.$storage.tables = defaultTabs;
            $scope.$storage.currentYear = $scope.newYear;
            $scope.$storage.mongoTabs.push({
                _id: $scope.newYear,                
                updateAt: new Date(),
                tables: $scope.$storage.tables
            });
            $scope.saveToCloud($scope.newYear);
            $scope.newYear = '';
        };
        $scope.saveToCloud = function (year) {
            $http.put('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/' + 
                   year + '?apiKey=4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
                { 
                    year: year,  
                    updateAt: $filter('getByYear')($scope.$storage.mongoTabs, $scope.$storage.currentYear).updateAt,   
                    tables: $scope.$storage.tables
                }).success(function (data, status, headers, config) {
                     Notification.info({message: 'Сохранен в облако.', title: year});
                }).error(function (data, status, headers, config) { 
                    Notification.error({message: status, title: year});
                });
        };
        $scope.deleteYear = function(year){           
            $scope.$storage.mongoTabs = $scope.$storage.mongoTabs
                .filter(function (el) {
                        return el._id != year;
            });
            MongoTables.delete({id: year}, function(){},function (err) { 
                    Notification.error({message: err.status, title: year});
                });
            delete $scope.$storage.currentYear;
        };
        var defaultTabs = [{
                country: 'england',
                games: [],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'germany',
                games: [],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'italy',
                games: [],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'spain',
                games: [],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'france',
                games: [],
                tourHeaders: [],
                commands: []
            }
                    ];
	}]);