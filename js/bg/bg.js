jQuery.noConflict();                               
jQuery(document).ready(function ($) {
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.create({'url': "qStealer.html", 'active': false}, function(tab){
		});
	});
});