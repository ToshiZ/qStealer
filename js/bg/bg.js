jQuery.noConflict();                               
jQuery(document).ready(function ($) {
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.create({'url': "total_tables.html", 'active': false}, function(tab){
		});
	});
});