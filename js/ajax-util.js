(function(global) {

	var ajaxUtil = {};
	ajaxUtil.sendGetRequest = function(requestUrl, responseHandler, isJson) {


		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			handleResponse(request, responseHandler, isJson);
		};
		request.open("GET", requestUrl, true);
		request.send(null);
	};

	function handleResponse(request, responseHandler, isJson) {

		if( (request.readyState == 4) && (request.status == 200) ) {

			if( isJson == undefined ) {
				isJsonResponse = true;
			}


			if(isJson) {
				responseHandler(JSON.parse(request.responseText));
			}
			else {
				responseHandler(request.responseText);
			}
		}
	}

	global.$ajaxUtil = ajaxUtil;


})(window);

