var Table = {
	constructor: function(name, jObj){
		this.name = name;
		this.tab = jObj;
		return this;
	}	
};
var fileMan = {
	openFile: function(callback){ 
		return function(event){
	        var files = event.target.files;
			//for(var i = 0, f; f = files[i]; i++){
				var f = files[0];
				if(f){
					var r = new FileReader();
					r.onload = (function(theFile){ 
	                    return function(e) {
	                    	var jFile = JSON.parse(e.target.result);
	                    	callback(jFile, theFile.name.split('.')[0]);
	                    }
					})(f);				
					r.readAsText(f);
				}		
				else 
					alert("Ошибка чтения файла.");
			//}		
		}
	}
}