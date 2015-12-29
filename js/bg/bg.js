$(function () {
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.create({'url': "qStealer.html", 'active': false}, function(tab){
		});
        chrome.tabs.create({ url: "http://baza-otvetov.ru/quiz" });
	});
});