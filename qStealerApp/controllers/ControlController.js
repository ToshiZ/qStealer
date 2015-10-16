'use strict';
angular.module('qStealerApp')
	.controller('ControlController', ['$scope', '$localStorage', '$http', '$filter', 'Notification', '$rootScope', function($scope, $localStorage, $http, $filter, Notification, $rootScope){
		 $rootScope.$storage = $localStorage.$default({
             qIds: [],
             questions : []
        });
        window.chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
                if (request.askFor == "contentScriptId"){
                    if( $scope.$storage.csId === undefined || $scope.$storage.csId != parseInt(sender.tab.id)){
                        $scope.$storage.csId = parseInt(sender.tab.id);
                    }
                }
        });
        window.chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
                if (request.askFor == "question"){
                    var qObj = JSON.parse(request.question)
                    if($localStorage.qIds.indexOf(qObj.qId) == -1){
                        $localStorage.questions.push(qObj);
                        $localStorage.qIds.push(qObj.qId);
                        $rootScope.$broadcast('qNow', qObj);
                        // $rootScope.qNow = {};
                        // $rootScope.qNow = qObj;
                        console.log(request.question);
                    }
                }
        });
        $scope.startSteal = function(){
            chrome.tabs.sendMessage($scope.$storage.csId, {askFor: 'startSteal'});
        }
}]);