'use strict';
angular.module('qStealerApp')
	.controller('ControlController', ['$scope', '$localStorage', '$http', '$filter', 'Notification', '$rootScope','jsonOperations', function($scope, $localStorage, $http, $filter, Notification, $rootScope, jsonOperations){
        $rootScope.$storage = $localStorage.$default({
             qIds: [],
             questions : [],
             tries : 0
        });
        
        var thisScope = this;
        thisScope.isNew = false;
        thisScope.currentQuestion = {};
        thisScope.currentQuestion['qId'] = $localStorage.qIds[$localStorage.qIds.length - 1];
        thisScope.qAmount = $localStorage.qIds.length;
        thisScope.tries = $localStorage.tries;		 
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
                    thisScope.tries = ++$localStorage.tries;

                    if($localStorage.qIds.length == 0 || $localStorage.qIds.indexOf(qObj.qId) == -1){
                        $localStorage.questions.push(qObj);
                        $localStorage.qIds.push(qObj.qId);
                        thisScope.isNew = true;
                    } else {
                        thisScope.isNew = false;
                        var inf = (100 - $localStorage.qIds.length*100/$localStorage.tries).toFixed(2) + '% промахов';
                        Notification.info({message: inf, title: "Такой уже есть"});
                    }

                    thisScope.qAmount = $localStorage.qIds.length;
                    thisScope.percentage = thisScope.qAmount*100/thisScope.tries;
                    thisScope.timeCheck = thisScope.timeCheck == undefined ? Date.now() : thisScope.timeCheck;
                    var tmpTime = ((Date.now() - thisScope.timeCheck)/1000);
                    thisScope.seconds = (tmpTime + tmpTime * (thisScope.qAmount/thisScope.tries).toFixed(3)).toFixed(1);
                    thisScope.timeCheck = Date.now();                    
                    $scope.$apply();
                }
        });                
        thisScope.startSteal = function(){
            // try{
                chrome.tabs.sendMessage($scope.$storage.csId, {askFor: 'startSteal'});
            // }
            // catch(e)
            // {
            //      Notification.info({message: 'Открой страницу http://baza-otvetov.ru/quiz в новой вкладке. Или перезагрузи страницу базы ответов.', title: "Синхронизация с сайтом"});
            // }
        }
        thisScope.stopSteal = function(){
            // try{
                chrome.tabs.sendMessage($scope.$storage.csId, {askFor: 'stopSteal'});
            // }
            // catch(e)
            // {
            //     Notification.info({message: 'Открой страницу базы ответов в новой вкладке. Или перезагрузи страницу базы ответов.', title: "Синхронизация с сайтом"});
            // }
        }
        thisScope.saveToFile = function(){
            try{
                var blob = new Blob([JSON.stringify($localStorage.questions)], {type: 'json/application'});
                    saveAs(blob, "storage.json");
            }
            catch(e){
                Notification.error({message: e.message, title: e.name});
            }
        }
        thisScope.clearAll = function(){
            $localStorage.$reset();
            $localStorage.$default({
                qIds: [],
                questions : [],
                tries : 0
            });
        }
}]);
