var extTabId = localStorage.getItem('extTabId')? parseInt(localStorage.getItem('extTabId')): undefined;
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

	var checkExist = setInterval(function() {
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
			var checkExist2 = setInterval(function() {
	   			if ($('h3.q_id').length) {
	   				getQuestion();
	   				clearInterval(checkExist2);
	   			}

	   		});
	   }
	}, 1000);
}
$(function(){
	chrome.runtime.sendMessage({askFor: 'contentScriptId'});
	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {      
            if (request.askFor == "startSteal"){
               		getQuestion();
            }
    });

});