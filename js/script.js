(function (global) {

	var upHelper = {};
	var contestListHTML = "snippets/contest-list-snippet.html";
	var problemElementHTML = "snippets/problem-element-snippet.html";

	var problemsURL = "https://codeforces.com/api/problemset.problems";
	var ratingChangeURL = "https://codeforces.com/api/user.rating?handle=";

	var limit = 50;


	var insertHTML = function(selector, html) {
		document.querySelector(selector).innerHTML = html;
	}
	var appendHTML = function(selector, html) {
		if(document.querySelector(selector).innerHTML == false) {
			document.querySelector(selector).innerHTML = html;
		}
		else document.querySelector(selector).innerHTML += html;
	}

	var insertText = function(selector, text) {
		document.querySelector(selector).textContent = text;
	}

	var insertProperty = function (string, propName, propVal)  {
		var propToreplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToreplace,"g"), propVal);
		return string;
	}

	var loadProblems = function(response) {
		if(response.status != "OK") return;

		upHelper.problems = response.result.problems.reverse();
		upHelper.problemStats = response.result.problemStatistics;

		$ajaxUtil.sendGetRequest(problemElementHTML, function(response) {

			for(var i = 0 ; i < upHelper.ratingChange.length ; i++ ) {

				var ok = false;
				for(var j = 0 ; j < upHelper.problems.length ; j++ ) {

					if( upHelper.ratingChange[i]["contestId"] == upHelper.problems[j]["contestId"] ) {
						var htmlCode = response;
						htmlCode = insertProperty(htmlCode, "problem_name", upHelper.problems[j]["contestId"]  + upHelper.problems[j]["index"] + " - "+ upHelper.problems[j]["name"] )
						htmlCode = insertProperty(htmlCode, "contest_id",  upHelper.problems[j]["contestId"] );
						htmlCode = insertProperty(htmlCode, "problem_index",  upHelper.problems[j]["index"] );
						appendHTML("#id_" + upHelper.problems[j]["contestId"], htmlCode);
						ok = true;
					}
				}
				if(ok == false) {
					console.log("well that was unexpected!, no info about contest: " + upHelper.ratingChange[i]["contestId"] );
				}
			}
		}, false);
	}

	var loadContestNames = function(response) {

		
		if(upHelper.ratingChange.length > 0) {
			insertText("h1", upHelper.ratingChange[0].handle);
		}
		var htmlCode = "";
		for(var i = 0 ; i < upHelper.ratingChange.length; i++) {

			var newRow = response;
			newRow = insertProperty(newRow, "contest_id", upHelper.ratingChange[i]["contestId"]);
			newRow = insertProperty(newRow, "contest_name", upHelper.ratingChange[i]["contestName"]);
			htmlCode += newRow;
		}
		insertHTML("#main-content", htmlCode);

		$ajaxUtil.sendGetRequest(problemsURL, loadProblems, true);

	}

	var buildHTML = function (response) {

		if(response.status != "OK") return;
		upHelper.ratingChange = response.result.reverse();

		$ajaxUtil.sendGetRequest(contestListHTML, loadContestNames, false);
	}

	document.addEventListener("DOMContentLoaded", function(event) {

		function handleData(event) {
			var inputHandle = document.querySelector("#inputHandle").value;
			var newRatingChangeURL = ratingChangeURL +  inputHandle;
			$ajaxUtil.sendGetRequest(newRatingChangeURL, buildHTML, true);
		}
		document.querySelector("button").addEventListener("click",handleData);
	});

	global.$upHelper = upHelper;

})(window);