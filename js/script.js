(function (global) {

	var upHelper = {};
	var contestListHTML = "snippets/contest-list-snippet.html";
	var problemElementHTML = "snippets/problem-element-snippet.html";

	var problemsURL = "https://codeforces.com/api/problemset.problems";
	var userInfoURL = "https://codeforces.com/api/user.info?handles=";
	var contestListURL = "https://codeforces.com/api/contest.list";
	var userStatusURL = "https://codeforces.com/api/user.status?handle=";

	problemMap = {};

	var limit = 100;


	var insertHTML = function(selector, html) {
		// var selection = document.querySelector(selector) !== null;
		 document.querySelector(selector).innerHTML = html;
	}
	var appendHTML = function(selector, html) {
		// var selection = document.querySelector(selector) !== null;
		 document.querySelector(selector).innerHTML += html;
	}

	var insertText = function(selector, text) {
		// var selection = document.querySelector(selector) !== null;
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
		upHelper.problemStats = response.result.problemStatistics.reverse(); // problems[i] and problemStats[i] both indicate same problem

		$ajaxUtil.sendGetRequest(problemElementHTML, function(response) {

			for(var i = 0 ; i < upHelper.contests.length ; i++ ) {

				var ok = false;
				for(var j = 0 ; j < upHelper.problemStats.length ; j++ ) {

					if( upHelper.contests[i]["id"] == upHelper.problemStats[j]["contestId"] ) {
						var htmlCode = response;
						htmlCode = insertProperty(htmlCode, "problem_name", upHelper.problemStats[j]["contestId"]  + upHelper.problemStats[j]["index"] + " - "+ upHelper.problems[j]["name"] );
						htmlCode = insertProperty(htmlCode, "contest_id",  upHelper.problemStats[j]["contestId"] );
						htmlCode = insertProperty(htmlCode, "problem_index",  upHelper.problemStats[j]["index"] );
						htmlCode = insertProperty(htmlCode, "solve_count",upHelper.problemStats[j]["solvedCount"] );
						appendHTML("#id_" + upHelper.problemStats[j]["contestId"], htmlCode);
						ok = true;

						problemMap[ "#id_" + upHelper.problemStats[j]["contestId"] + upHelper.problemStats[j]["index"] ] = 1;
					}
				}
				if(ok == false) {
					console.log("well that was unexpected!, no info about contest: " + upHelper.contests[i]["id"] +upHelper.contests[i]["name"] );
				}
			}

			$ajaxUtil.sendGetRequest(userStatusURL + upHelper.userHandle,function(response) {

				if(response.status != "OK") return;

				upHelper.userStatus = response.result;

				for(var id in upHelper.userStatus) {
					if( upHelper.userStatus[id]["verdict"] != "OK") continue;
					var tgt = "#id_" + upHelper.userStatus[id]["problem"]["contestId"] + upHelper.userStatus[id]["problem"]["index"];
					
					if(problemMap[tgt] == 1)  {
						// console.log("got: " +  tgt);
						// var ret = document.querySelector(tgt).innerHTML;
						// ret = ret.replace(new RegExp("{{icon}}","g"), "glyphicon glyphicon-ok");
						// document.querySelector(tgt).innerHTML = ret;
						appendHTML(tgt, "(AC)")
					}
				}


			},true);

		}, false);
	}

	var loadContestNames = function(response) {

		var htmlCode = "";
		for(var i = 0 ; i < upHelper.contests.length; i++) {

			var newRow = response;
			newRow = insertProperty(newRow, "contest_id", upHelper.contests[i]["id"]);
			newRow = insertProperty(newRow, "contest_name", upHelper.contests[i]["name"]);
			htmlCode += newRow;
		}
		insertHTML("#main-content", htmlCode);

		$ajaxUtil.sendGetRequest(problemsURL, loadProblems, true);

	}

	var buildHTML = function (response) {

		if(response.status != "OK") return;
		upHelper.contests = []

		var contestCnt = 0, id = 0;
		while(contestCnt < limit  && id < 1000) {

			if(response.result[id]["phase"] == "FINISHED") {
				upHelper.contests[contestCnt] = response.result[id];
				contestCnt++;
			}
			id++;
		}

		$ajaxUtil.sendGetRequest(contestListHTML, loadContestNames, false);
	}

	var updateUserHandle = function(response) {

		if(response.status != "OK") return;
		upHelper.userHandle = response.result[0].handle;
		insertText("h1", response.result[0].handle);
	}

	document.addEventListener("DOMContentLoaded", function(event) {

		function handleData(event) {
			var inputHandle = document.querySelector("#inputHandle").value;
			var newUserInfoURL = userInfoURL +  inputHandle;


			$ajaxUtil.sendGetRequest(newUserInfoURL, updateUserHandle, true);
			$ajaxUtil.sendGetRequest(contestListURL, buildHTML, true);



		}
		document.querySelector("button").addEventListener("click",handleData);
	});

	global.$upHelper = upHelper;

})(window);