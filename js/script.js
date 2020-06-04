(function (global) {

	var upHelper = {};
	var contestListHTML = "snippets/contest-list-snippet.html";


	var insertHTML = function(selector, html) {
		document.querySelector(selector).innerHTML = html;
	}

	var insertText = function(selector, text) {
		document.querySelector(selector).textContent = text;
	}

	var insertProperty = function (string, propName, propVal)  {
		var propToreplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToreplace,"g"), propVal);
		return string;
	}

	var loadContestNames = function(response) {

		console.log(upHelper.result);
		if(upHelper.result.length > 0) {
			insertText("h1", upHelper.result[0].handle);
		}
		var htmlCode = "";
		upHelper.result.reverse();
		for(var i = 0 ; i < upHelper.result.length; i++) {

			var newRow = insertProperty(response, "contest_id", upHelper.result[i]["contestId"]);
			newRow = insertProperty(newRow, "contest_name", upHelper.result[i]["contestName"]);
			htmlCode += newRow;
		}
		insertHTML("#main-content", htmlCode);
	}

	var buildHTML = function (response) {

		if(response.status != "OK") return;
		upHelper.result = response.result;

		$ajaxUtil.sendGetRequest(contestListHTML, loadContestNames, false);
	}

	document.addEventListener("DOMContentLoaded", function(event) {

		function handleData(event) {
			var inputHandle = document.querySelector("#inputHandle").value;
			var cfAPIUrl = "https://codeforces.com/api/user.rating?handle=" +  inputHandle;
			$ajaxUtil.sendGetRequest(cfAPIUrl, buildHTML, true);
		}
		document.querySelector("button").addEventListener("click",handleData);
	});

	global.$upHelper = upHelper;

})(window);