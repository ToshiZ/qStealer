'use strict';
angular.module('TotalTablesApp')
	.controller('TableController', ['$scope', '$filter', '$routeParams', '$localStorage', '$http', 'Notification', function($scope, $filter, $routeParams, $localStorage, $http, Notification){ 
        $scope.tablesInit = function(){
            $scope.changed = false;
            $scope.$storage = $localStorage;
            $scope.country = $routeParams.country;
            if($scope.$storage.currentYear){
                $scope.tablesByYear = $filter('getByYear')($scope.$storage.mongoTabs, $scope.$storage.currentYear);
                $scope.table =  $filter('getBycountry')($scope.tablesByYear.tables, $scope.country);        
            }else{
                Notification.error('Не выбран год.');
            }   
        };
        $scope.strToDate = function(str){
            var d = new Date(str);
            return (d.getDate()) + '/' + (d.getMonth() + 1); 
        };
        $scope.changing = function(){
            $scope.changed = true;
        };
        $scope.addTour = function(){
            if($scope.table.tourHeaders.indexOf($scope.newTour.toDateString()) != -1){
                $scope.newTour = '';
                Notification.warning('Такой тур уже есть.');
            }else{
                $scope.table.tourHeaders.push($scope.newTour.toDateString());
                $scope.table.tourHeaders.sort(function(a,b){
                    return new Date(a) - new Date(b);
                });
                $scope.changing();
                $scope.newTour = '';
            }
        };
        $scope.addCommand = function(){
            if($scope.table.commands.indexOf($scope.newCommand) != -1){
                $scope.newCommand = '';
                Notification.warning('Такая команда уже есть.');
            }else{
                $scope.table.commands.push($scope.newCommand.trim());
                $scope.table.games.push({command: $scope.newCommand.trim(), tours: {}});
                $scope.changing();
                $scope.newCommand = '';
            }
        };
        $scope.removeTour = function(tourName){
            $scope.table.tourHeaders.splice($scope.table.tourHeaders.indexOf(tourName),1);
            for(var g in $scope.table.games)
                delete $scope.table.games[g].tours[tourName];
            $scope.changing();
        };
        $scope.removeCommad = function(commandName){
            $scope.table.commands.splice($scope.table.commands.indexOf(commandName),1);
            $scope.table.games = $scope.table.games
                .filter(function (el) {
                        return el.command != commandName;
            });
            $scope.changing();
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
                             Notification.success({message: 'Сохранен в облако.', title: year});
                             $scope.changed = false;
                        }).error(function (data, status, headers, config) { 
                            Notification.error({message: status, title: year});
                        });
                    }
                }
        };
        $scope.$on("$destroy", function(){
            $scope.saveToCloud($scope.$storage.currentYear);
        });
        $scope.sortableOptions = {
            stop: $scope.changing(),
            axis: 'y'
        };
        $scope.selectTour = function(t, game, games, e){
            if(e.target.nodeName == 'TD'){
                for(var g in games){
                    
                }
                t['clicked'] = t['clicked'] == undefined? true: (t['clicked']? false: true);
                $scope.changing();
            }
        };
	}]);