'use strict';
angular.module('qStealerApp')
	.controller('ControlController', ['$scope', '$localStorage', '$http', '$filter', 'Notification', '$rootScope', function($scope, $localStorage, $http, $filter, Notification, $rootScope){
        var thisScope = this;
        var ids = $localStorage.qIds;
        thisScope.currentQuestion = {};
        thisScope.currentQuestion['qId'] = ids[ids.length - 1];
        thisScope.qAmount = ids.length;
		 $rootScope.$storage = $localStorage.$default({
             qIds: [],
             questions : []
        });
        window.chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
                if (request.askFor == "contentScriptId"){
                    if( $scope.$storage.csId === undefined || 
                        $scope.$storage.csId != parseInt(sender.tab.id)){
                        $scope.$storage.csId = parseInt(sender.tab.id);
                    }
                }
        });
        window.chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
                if (request.askFor == "question"){
                    var qObj = JSON.parse(request.question)
                    thisScope.currentQuestion = qObj;
                    thisScope.qAmount = ids.length;
                    $scope.$apply();
                    if($localStorage.qIds.indexOf(qObj.qId) == -1){
                        $localStorage.questions.push(qObj);
                        $localStorage.qIds.push(qObj.qId);
                        $rootScope.$broadcast('qCurrent', qObj);
                        console.log(request.question);
                    } else {
                        $rootScope.$broadcast('qCurrentSame', qObj);
                    }
                }
        });
        this.startSteal = function(){
            chrome.tabs.sendMessage($scope.$storage.csId, {askFor: 'startSteal'});
        }
        this.stopSteal = function(){
            chrome.tabs.sendMessage($scope.$storage.csId, {askFor: 'stopSteal'});
        }
}]);