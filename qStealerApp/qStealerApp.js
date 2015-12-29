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
		    .otherwise({ redirectTo: '/main' });
	}]);
qStealerApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
]);
qStealerApp.factory('jsonOperations', function () {
	var lsJson = [];
	var fileContent = [];
    function onInitFs(fs) {    	
		// fs.root.getFile('/storage.txt', {create: true}, function(fileEntry) {
		//     fileEntry.file(function(file) {
		//        	var reader = new FileReader();
		//        	reader.onloadend = function(e) {
		//        		fileContent = this.result;
		//        	};
		//        	reader.readAsText(file);
		//     }, errorHandler);
		// }, errorHandler);

		// for (var i = 0; i < lsJson.length - 1; i++){
		// 	fileContent.push(lsJson[i]);
		// }

		fs.root.getFile("storage.txt", {create: true}, function(fileEntry) {
		    fileEntry.createWriter(function(fileWriter) {
		      	fileWriter.onwriteend = function(e) {
		        	console.log('Write completed.');
		      	};
		      	fileWriter.onerror = function(e) {
		        	console.log('Write failed: ' + e.toString());
		      	};
		      	//var blob = new Blob([JSON.stringify(fileContent)], {type: 'text/plain'});
		      	
		      	fileWriter.write(blob);
		    }, errorHandler);
		}, errorHandler);
	}
	
	function errorHandler(e) {
		  var msg = '';

			  switch (e.code) {
			    case FileError.QUOTA_EXCEEDED_ERR:
			      msg = 'QUOTA_EXCEEDED_ERR';
			      break;
			    case FileError.NOT_FOUND_ERR:
			      msg = 'NOT_FOUND_ERR';
			      break;
			    case FileError.SECURITY_ERR:
			      msg = 'SECURITY_ERR';
			      break;
			    case FileError.INVALID_MODIFICATION_ERR:
			      msg = 'INVALID_MODIFICATION_ERR';
			      break;
			    case FileError.INVALID_STATE_ERR:
			      msg = 'INVALID_STATE_ERR';
			      break;
			    default:
			      msg = 'Unknown Error';
			      break;
			  };

			  console.log('Error: ' + msg);
	};

	return function(ls){
		var blob = new Blob(['asdasd'], {type: 'text/plain'});
		      	saveAs(blob, "hello world.txt");
		lsJson = ls;
		window.webkitRequestFileSystem(window.TEMPORARY, 5*1024*1024, onInitFs, errorHandler);
	}	
	}
);

