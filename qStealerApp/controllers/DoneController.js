
var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
		// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
		// for the reasoning behind the timeout and revocation flow
		, arbitrary_revoke_timeout = 500 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			if (view.chrome) {
				revoker();
			} else {
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (target_view && is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab == undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}
// 'use strict';
// angular.module('qStealerApp')
// 	.controller('DoneController', ['$scope', '$localStorage', '$http', 'Notification', '$filter', '$location', '$anchorScroll', '$rootScope', function($scope, $localStorage, $http, Notification, $filter, $location, $anchorScroll, $rootScope){
//         var thisScope = this;
//         var ids = $localStorage.qIds;
//         thisScope.currentQuestion = {};
//         thisScope.currentQuestion['qId'] = ids[ids.length - 1];
//         thisScope.qAmount = ids.length;
//         $scope.$on('qCurrent', function (event, data) {
//             thisScope.currentQuestion = data;
//             thisScope.qAmount = ids.length;
//             $scope.$apply();
//         });
//          $scope.$on('qCurrentSame', function (event, data) {
//             thisScope.currentQuestion = data;
//             $scope.$apply();
//         });
//         //$scope.$storage = $localStorage;
//         // $scope.getAllTours = function(){
//         //     $scope.changed = false;
// //             $scope.$storage = $localStorage;
// //             $scope.findQuery = {allBlocksBigger: {}, allBlocksLess: {}};
// //             if($scope.$storage.currentYear){
// //                 $scope.tablesByYear = $filter('getByYear')($scope.$storage.mongoTabs, $scope.$storage.currentYear).tables;
// //             }else{
// //                 Notification.error('Не выбран год.');
// //             }            
// //             $scope.refreshTotals();
// //         };
// //         $scope.refreshTotals = function(){            
// //             $scope.allTours = [];
// //             $scope.totals = {};
// //             $scope.names = {};  
// //             for(var t in $scope.tablesByYear)
// //                 $scope.names[t] = $scope.tablesByYear[t].country;
// //             $scope.findBlocks($scope.tablesByYear, $scope.totals);
// //             $scope.allTours.sort(function(a,b){
// //                 return new Date(a) - new Date(b);
// //             });
// //         };
// //         $scope.findBlocks = function(tab, totalsVar, combination){
// //             var iters = [];
// //             if(combination)
// //                 iters = combination;
// //             else
// //                 for(var i in tab)
// //                     iters[i] = i;
// //             for(var t = 0; t < iters.length; t++){
// //                 for(var g in tab[iters[t]].games){
// //                     for(var tour in tab[iters[t]].games[g].tours){
// //                         if($scope.allTours.indexOf(tour) == -1)
// //                             $scope.allTours.push(tour);
// //                         if(!totalsVar.hasOwnProperty(tour)){
// //                                 totalsVar[tour] = {};
// //                                 totalsVar[tour]['bigger2'] = 0;
// //                                 totalsVar[tour]['less2'] = 0;
// //                                 totalsVar[tour]['lastLess'] = false;
// //                                 totalsVar[tour]['lastBigger'] = false;
// //                                 totalsVar[tour]['blockBigger'] = 0;
// //                                 totalsVar[tour]['blockLess'] = 0;
// //                                 totalsVar[tour]['allBlocksBigger'] = {};
// //                                 totalsVar[tour]['allBlocksLess'] = {};
// //                             }
// //                         if(!tab[iters[t]].games[g].tours[tour].clicked){
// //                             if(tab[iters[t]].games[g].tours[tour][0] + 
// //                                 tab[iters[t]].games[g].tours[tour][1] > 2){
// //                                 totalsVar[tour].bigger2++;
// //                                 if(totalsVar[tour].lastBigger){
// //                                     totalsVar[tour].blockBigger++;
// //                                     ////
// //                                 }else{
// //                                     totalsVar[tour].lastBigger = true;
// //                                     totalsVar[tour].lastLess = false;
// //                                     if(totalsVar[tour].allBlocksLess
// //                                         .hasOwnProperty(totalsVar[tour].blockLess)){
// //                                         totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess]++;
// //                                     }else if(totalsVar[tour].blockLess != 0){
// //                                         totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess] = 1;
// //                                     }
// //                                     totalsVar[tour].blockLess = 0;
// //                                 }
// //                             }else if(tab[iters[t]].games[g].tours[tour][0] + 
// //                                         tab[iters[t]].games[g].tours[tour][1] <= 2){
// //                                 totalsVar[tour].less2++;
// //                                 if(totalsVar[tour].lastLess){
// //                                     totalsVar[tour].blockLess++;
// //                                     /////
// //                                 }else{
// //                                     totalsVar[tour].lastLess = true;
// //                                     totalsVar[tour].lastBigger = false;
// //                                     if(totalsVar[tour].allBlocksBigger
// //                                         .hasOwnProperty(totalsVar[tour].blockBigger)){
// //                                         totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger]++;
// //                                     }else if(totalsVar[tour].blockBigger != 0){
// //                                         totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger] = 1;
// //                                     }
// //                                     totalsVar[tour].blockBigger = 0;
// //                                 }
// //                             }
// //                         }
// //                     }
// //                 }
// //             }
// //             for(var tour in totalsVar){
// //                 if(totalsVar[tour].allBlocksBigger
// //                     .hasOwnProperty(totalsVar[tour].blockBigger)){
// //                     totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger]++;
// //                 }else if(totalsVar[tour].blockBigger != 0){
// //                     totalsVar[tour].allBlocksBigger[totalsVar[tour].blockBigger] = 1;
// //                 }
// //                 totalsVar[tour].blockBigger = 0;
// //                 if($scope.totals[tour].allBlocksLess
// //                     .hasOwnProperty(totalsVar[tour].blockLess)){
// //                     totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess]++;
// //                 }else if(totalsVar[tour].blockLess != 0){
// //                     totalsVar[tour].allBlocksLess[totalsVar[tour].blockLess] = 1;
// //                 }
// //                 totalsVar[tour].blockLess = 0;                
// //             }
// //         };        
// //         $scope.dragStop = function(){            
// //             $scope.refreshTotals();
// //             $scope.changed = true;
// //         };
// //         $scope.strToDate = function(str){
// //             var d = new Date(str);
// //             return (d.getDate()) + '/' + (d.getMonth() + 1); 
// //         };
// //         $scope.getInt = function(t){
// //             return parseInt(t);
// //         }; 
// //         $scope.saveToCloud = function (year) {
// //             if($scope.$storage.currentYear){
// //                 if($scope.changed){
// //                     $scope.tablesByYear.updateAt = new Date();
// //                     $http.put('https://api.mongolab.com/api/1/databases/table_gun_db/collections/tables/' + 
// //                            year + '?apiKey=4uxrgilMV5QDHqsTP4UdsWG7B8E66KZ1',
// //                         { 
// //                             year: year,
// //                             updateAt: $scope.tablesByYear.updateAt,
// //                             tables: $scope.$storage.tables
// //                         }).success(function (data, status, headers, config) {
// //                              Notification.info({message: 'Сохранен в облако.', title: year});
// //                              $scope.changed = false;
// //                         }).error(function (data, status, headers, config) { 
// //                             Notification.error({message: status, title: year});
// //                         });
// //                 }
// //             }
// //         };
// //         $scope.selectTour = function(tour){
// //             $scope.selectedTour = tour;
// //         };
// //         $scope.selectResult = function(index){
// //             //$scope.selectedResult = index;
// //             var tmp = [];
// //             for(var t in $scope.tablesByYear){
// //                 tmp[t] = $scope.tablesByYear[$scope.findResults[index][t]];
// //             }
// //             $scope.tablesByYear = tmp.slice();
// //             $location.hash('top');
// //             $anchorScroll();
// //         };
// //         $scope.orderVariants = function(){
// //             //$scope.selectedResult = undefined;
// //             var allTabs = $scope.tablesByYear.slice();
// //             var tmp = [];
// //             $scope.names = {};
// //             for(var i = 0; i < allTabs.length; i++){
// //                 tmp[i] = i;
// //                 $scope.names[i] = allTabs[i].country;
// //             }
// //             var combs = combinations(tmp);
// //             $scope.findResults = [];
// //             for(var i = 0; i < combs.length;)
// //                 topLoop: {
// //                 var totalsVar = {};
// //                 $scope.findBlocks(allTabs, totalsVar, combs[i]);
// //                 if(!$.isEmptyObject(totalsVar[$scope.selectedTour].allBlocksBigger) && $scope.biggerNullBlock){
// //                     combs.splice(i, 1);
// //                     continue;
// //                 }
// //                 if(!$.isEmptyObject(totalsVar[$scope.selectedTour].allBlocksLess) && $scope.lessNullBlock){
// //                     combs.splice(i, 1);
// //                     continue;
// //                 }
// //                 for(var q in $scope.findQuery.allBlocksBigger){
// //                     if(($scope.findQuery.allBlocksBigger[q] > totalsVar[$scope.selectedTour].allBlocksBigger[q] && !$.isEmptyObject($scope.findQuery.allBlocksBigger)) || (!totalsVar[$scope.selectedTour].allBlocksBigger.hasOwnProperty(q))){
// //                         combs.splice(i, 1);
// //                         break topLoop;
// //                     }
// //                 }
// //                 for(var q in $scope.findQuery.allBlocksLess){
// //                     if(($scope.findQuery.allBlocksLess[q] > totalsVar[$scope.selectedTour].allBlocksLess[q] && !$.isEmptyObject($scope.findQuery.allBlocksLess)) || (!totalsVar[$scope.selectedTour].allBlocksLess.hasOwnProperty(q))){
// //                         combs.splice(i, 1);
// //                         break topLoop;
// //                     }
// //                 }
// //                 i++;
// //             }
// //             $scope.findResults = combs;
// //         };
// //         $scope.deleteBiggerBlock = function(block){
// //             delete $scope.findQuery.allBlocksBigger[block];
// //         };
// //         $scope.deleteLessBlock = function(block){
// //             delete $scope.findQuery.allBlocksLess[block];
// //         };
// //         $scope.$watchCollection('tablesByYear', function(newValue, oldValue){
// //             if(newValue === oldValue)
// //                 return;
// //             $scope.dragStop();
// //         });
// //         $scope.$on("$destroy", function(){
// //             $scope.saveToCloud($scope.$storage.currentYear);
// //         });     
// //         function combinations(arr) {
// //         if(arr.length >1){
// //             var beg = arr[0],
// //                 arr1 = combinations(arr.slice(1)),
// //                 arr2 = [],
// //                 l = arr1[0].length;
// //                 for(var i=0; i < arr1.length; i++)
// //                     for(var j=0; j <= l; j++)
// //                         arr2.push(arr1[i].slice(0,j).concat(beg, arr1[i].slice(j)));
// //                 return arr2;
// //         }else return [arr];
// //     }  
// }]);