'use strict';
var TotalTablesApp = angular.module('TotalTablesApp', ['ngResource','ngRoute', 'ngStorage', 'ui.sortable', 'ui.tree', 'ui-notification']);
TotalTablesApp.config(['$routeProvider', '$locationProvider',function ($routeProvider, $locationProvider) {
		 //  $locationProvider.html5Mode({
			//   enabled: true,
			//   requireBase: false
			// });
		  $routeProvider
		    .when('/table',
		      { templateUrl: 'TotalTablesApp/templates/main-page.html',
		        controller: "MainController" })
		    .when('/table/:country',
		      { templateUrl: 'TotalTablesApp/templates/table.html',
		        controller: "TableController" })
		    .when('/all',
		      { templateUrl: 'TotalTablesApp/templates/joiner.html',
		        controller: "JoinerController" })
		    .otherwise({ redirectTo: '/table' });
	}]);
TotalTablesApp.filter('getBycountry', function() {
	return function(input, countryName) {
	var i=0, len=input.length;
	for (; i<len; i++) {
	  if (input[i].country == countryName) {
	    return input[i];
	  }
	}
	return null;
	}
});
TotalTablesApp.filter('getByYear', function() {
	return function(input, year) {
	var i=0, len=input.length;
	for (; i<len; i++) {
	  if (input[i]._id == year) {
	    return input[i];
	  }
	}
	return null;
	}
});
TotalTablesApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
TotalTablesApp.factory('MongoTables', function ($resource) {
    var MongoTables = $resource('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/:id',
    {
      apiKey:'4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
      id:'@_id.$oid'
    });

    return MongoTables;
})