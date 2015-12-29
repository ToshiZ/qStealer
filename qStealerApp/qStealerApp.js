'use strict';
var qStealerApp = angular.module('qStealerApp', ['ngResource','ngRoute', 'ngStorage', 'ui.sortable', 'ui.tree', 'ui-notification']);
qStealerApp.config(['$routeProvider', '$locationProvider',function ($routeProvider, $locationProvider) {
		  $routeProvider
		    .when('/main',
		      { templateUrl: 'qStealerApp/templates/control.html',
		        controller: "ControlController",
		        controllerAs: "contrl"})
		    .when('/control',
		      { templateUrl: 'qStealerApp/templates/control.html',
		        controller: "ControlController",
		        controllerAs: "contrl"})
		    // .when('/done',
		    //   { templateUrl: 'qStealerApp/templates/done.html',
		    //     controller: "DoneController",
		    // 	controllerAs: "done"})
		    .otherwise({ redirectTo: '/main' });
	}]);
qStealerApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
