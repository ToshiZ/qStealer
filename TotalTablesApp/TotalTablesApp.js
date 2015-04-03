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
});
TotalTablesApp.directive('ngDraggable', function($document) {
  return {
    restrict: 'A',
    scope: {
      dragOptions: '=ngDraggable'
    },
    link: function(scope, elem, attr) {
      var startX, startY, x = 0, y = 0,
          start, stop, drag, container;

      var width  = elem[0].offsetWidth,
          height = elem[0].offsetHeight;

      // Obtain drag options
      if (scope.dragOptions) {
        start  = scope.dragOptions.start;
        drag   = scope.dragOptions.drag;
        stop   = scope.dragOptions.stop;
        var id = scope.dragOptions.container;
        container = document.getElementById(id).getBoundingClientRect();
      }

      // Bind mousedown event
      elem.on('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX - elem[0].offsetLeft;
        startY = e.clientY - elem[0].offsetTop;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        if (start) start(e);
      });

      // Handle drag event
      function mousemove(e) {
        y = e.clientY - startY;
        x = e.clientX - startX;
        setPosition();
        if (drag) drag(e);
      }

      // Unbind drag events
      function mouseup(e) {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        if (stop) stop(e);
      }

      // Move element, within container if provided
      function setPosition() {
        if (container) {
          if (x < container.left) {
            x = container.left;
          } else if (x > container.right - width) {
            x = container.right - width;
          }
          if (y < container.top) {
            y = container.top;
          } else if (y > container.bottom - height) {
            y = container.bottom - height;
          }
        }

        elem.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }
    }
  }

});