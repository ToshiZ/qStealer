'use strict';
angular.module('TotalTablesApp')
	.controller('MainController', ['$scope', '$localStorage', 'MongoTables', '$http', function($scope, $localStorage, MongoTables, $http){
		 $scope.$storage = $localStorage.$default({
            tables: defaultTabs,
             order: ['england', 'germany', 'italy', 'spain', 'france'],
             translater: {
                 england: 'Англия',
                 germany: 'Германия',
                 italy: 'Италия',
                 spain: 'Испания',
                 france: 'Франция'
             }
        });
        $scope.getAllFromMongo = function(){
            MongoTables.query(function(data){
                $scope.$storage.mongoTabs = data;
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
                tables: $scope.$storage.tables
            });
            $scope.saveToCloud($scope.newYear);
        };
        $scope.saveToCloud = function (year) {
            $http.put('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/' + 
                   year + '?apiKey=4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
              { 
                year: year,
                tables: $scope.$storage.tables
              }).success(function (data, status, headers, config) {
                
              }).error(function (data, status, headers, config) { alert(status) });
        };
        $scope.deleteYear = function(year){
            MongoTables.delete({id: year});
            $scope.$storage.mongoTabs = $scope.$storage.mongoTabs
                .filter(function (el) {
                        return el._id != year;
            });
        };
        var defaultTabs = [{
                country: 'england',
                games: [
                    // {
                    //     command: '',
                    //     tours: {}
                    // }
                ],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'germany',
                games: [
                    // {
                    //     command: '',
                    //     tours: {}
                    // }
                ],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'italy',
                games: [
                    // {
                    //     command: '',
                    //     tours: {}
                    // }
                ],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'spain',
                games: [
                    // {
                    //     command: '',
                    //     tours: {}
                    // }
                ],
                tourHeaders: [],
                commands: []
            },
            {
                country: 'france',
                games: [
                    // {
                    //     command: '',
                    //     tours: {}
                    // }
                ],
                tourHeaders: [],
                commands: []
            }
                    ];
	}]);