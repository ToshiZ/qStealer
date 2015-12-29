var extTabId = localStorage.getItem('extTabId')? parseInt(localStorage.getItem('extTabId')): undefined;
// var pause = localStorage.getItem('pause')? parseInt(localStorage.getItem('pause')): 1;
var checkExist, checkExistInner;

function getQuestion(){
	var qObj = {},
		qElement = $('h3.q_id'),
		answersElement = $('tbody h4');
	qObj.qId = qElement.attr('id');
	qObj.qBody = qElement.html();
	qObj.answers = [
		answersElement[0].innerHTML,
		answersElement[1].innerHTML,
		answersElement[2].innerHTML,
		answersElement[3].innerHTML 
	];
	answersElement[0].click();

	checkExist = setInterval(function() {
	   if ($('h3[style]').length) {
	      	if($('h3[style]').html().indexOf('Не верно!') != -1){
				qObj.truth = $('h3[style]').html().split('Правильный ответ:')[1].replace("\<\/span>", '').trim();
			} else {
				if($('h3[style]').html().indexOf('Правильно!') != -1){
					qObj.truth = $('h3[style]').html().split('Правильно!')[1].replace(/\<br>/g, '').trim();
				}
			}
			chrome.runtime.sendMessage({askFor: 'question', question: JSON.stringify(qObj)});
			
		    clearInterval(checkExist);
			$('div.check a')[1].click();
			checkExistInner = setInterval(function() {
	   			if ($('h3.q_id').length) {
	   				getQuestion();
	   				clearInterval(checkExistInner);
	   			}

	   		});
	   }
	}, 1000);
}
$(function(){
	// if(pause == 0){
	// 	getQuestion();
	// }
	chrome.runtime.sendMessage({askFor: 'contentScriptId'});
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
        if (request.askFor == "startSteal"){
           		getQuestion();
           		// pause = 0;
           		// localStorage.setItem('pause', 0);
           	}
    });
    // chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
    //     if (request.askFor == "reload"){
    //        		location.reload();
    //        	}
    // });
    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
            if (request.askFor == "stopSteal"){
               		clearInterval(checkExist);
               		clearInterval(checkExistInner);
               		//pause = 1;
           			// localStorage.setItem('pause', 1);
            }
    });

});