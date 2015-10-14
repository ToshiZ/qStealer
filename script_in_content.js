$(function(){
	chrome.runtime.sendMessage({askFor: 'contentScriptId'});
	console.log($('.right').html());
});