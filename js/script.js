(function (global) {

	var upHelper = {};
	var contestListHTML = "snippets/contest-list-snippet.html";
	var problemElementHTML = "snippets/problem-element-snippet.html";

	var problemsURL = "https://codeforces.com/api/problemset.problems";
	var userInfoURL = "https://codeforces.com/api/user.info?handles=";
	var contestListURL = "https://codeforces.com/api/contest.list";
	var userStatusURL = "https://codeforces.com/api/user.status?handle=";

	problemMap = {};
	var t0 = 0;
	var t1 = 0;


	var printTime = function() {
		console.log(t1 - t0 + "ms" );
	}

	var insertHTML = function(selector, html) {
		 document.querySelector(selector).innerHTML = html;
	}
	var appendHTML = function(selector, html) {
		 document.querySelector(selector).innerHTML += html;
	}

	var insertText = function(selector, text) {
		 document.querySelector(selector).textContent = text;
	}

	var insertProperty = function (string, propName, propVal)  {
		var propToreplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToreplace,"g"), propVal);
		return string;
	}

	var getHTMLbySelector = function(selector) {
		return document.querySelector(selector).innerHTML;
	}



	var updateAC = function(response) {



		if(response.status != "OK") return;

		upHelper.userStatus = response.result;

		// console.log(upHelper.userStatus);
		// console.log(upHelper.contestRecord);

		for(var id in upHelper.userStatus) {
			if( upHelper.userStatus[id]["verdict"] != "OK") continue;
			if(upHelper.userStatus[id]["problem"]["contestId"]> 100000) continue;
			var tgt = ".id_" + upHelper.userStatus[id]["problem"]["contestId"] + upHelper.userStatus[id]["problem"]["index"];
			
			if(problemMap[tgt] == 1)  {

				document.querySelector(tgt).style.backgroundColor = "#28a745";
				// console.log(tgt);
				problemMap[tgt] = 0;
				
			}
			else if(problemMap[tgt] == undefined ){
				
				var frm = upHelper.userStatus[id]["problem"]["contestId"] - 10;
				var to = upHelper.userStatus[id]["problem"]["contestId"] + 10;
				var ok = 0;

				for(var i = frm ; i <= to ; i++ ) {
					var name = upHelper.userStatus[id]["problem"]["name"];
					var prevContestId = i;

					if(upHelper.contestRecord[ prevContestId ]) {
						
						for(var j = 0; j < upHelper.contestRecord[ prevContestId ]["problemList"].length ; j++) {

							if(upHelper.contestRecord[ prevContestId ]["problemList"][ j ]["name"] != name) continue;
							tgt = ".id_" + prevContestId + upHelper.contestRecord[ prevContestId ]["problemList"][ j ]["index"];
							if(problemMap[tgt] == 1)  {

								document.querySelector(tgt).style.backgroundColor = "#28a745";
								problemMap[tgt] = 0;
								ok = 1;
								break;
							}
							else if(problemMap[tgt] ==0) {
								ok = 1;
								break;
							}

						}
					}
				}
				// if(ok == 0 ) {
				// 	console.log("Couldn't find: " + upHelper.userStatus[id]["contestId"] +" -> "+ upHelper.userStatus[id]["problem"]["index"] + " " + upHelper.userStatus[id]["problem"]["name"]);
				// }
				

			}
		}
	}

	var setProblems = function(response) {

		for(var j = 0 ; j < upHelper.problemStats.length ; j++ ) {

			var htmlCode = response;
			htmlCode = insertProperty(htmlCode, "problem_name", upHelper.problemStats[j]["contestId"]  + upHelper.problemStats[j]["index"] + " - "+ upHelper.problems[j]["name"] );
			htmlCode = insertProperty(htmlCode, "contest_id",  upHelper.problemStats[j]["contestId"] );
			htmlCode = insertProperty(htmlCode, "problem_index",  upHelper.problemStats[j]["index"] );
			htmlCode = insertProperty(htmlCode, "solve_count",upHelper.problemStats[j]["solvedCount"] );
			appendHTML("#id_" + upHelper.problemStats[j]["contestId"], htmlCode);

			problemMap[ ".id_" + upHelper.problemStats[j]["contestId"] + upHelper.problemStats[j]["index"] ] = 1;
		}
		$ajaxUtil.sendGetRequest(userStatusURL + upHelper.userHandle, updateAC, true);
	}



	var loadContestNames = function (response) {	//4


		if(response.status != "OK") return;


		$ajaxUtil.sendGetRequest(contestListHTML, function(htmlSnippet){

			var htmlCode = "";


			for(var i = 0 ; i < response.result.length ; i++) {

				var contestId = response.result[i]["id"];
				var contestName = response.result[i]["name"];
				if(response.result[i]["phase"] != "FINISHED") continue;
				if(upHelper.contestRecord[contestId] == undefined) {
					continue;
				}
				upHelper.contestRecord[contestId]["contestName"] = contestName;


				var newRow = htmlSnippet;
				newRow = insertProperty(newRow, "contest_id", contestId);
				newRow = insertProperty(newRow, "contest_name", contestName);
				htmlCode += newRow;
			}
			insertHTML("#main-content", htmlCode);
			
			$ajaxUtil.sendGetRequest(problemElementHTML, setProblems, false);

		}, false);
	}

	var loadProblems = function(response) {	//3
		if(response.status != "OK") return;

		upHelper.contestRecord = new Array();
		upHelper.problems = response.result.problems.reverse();
		upHelper.problemStats = response.result.problemStatistics.reverse(); // problems[i] and problemStats[i] both indicate same problem


		for(var i = 0 ; i < upHelper.problems.length ; i++ ) {

			if(upHelper.problems[i]["conestId"] != upHelper.problemStats[i]["conestId"] || upHelper.problems[i]["index"] != upHelper.problemStats[i]["index"] )  {
				console.log("ERROR!");
				continue;
			}
			upHelper.problems[i]["solvedCount"] = upHelper.problemStats[i]["solvedCount"];

			var contestId = upHelper.problems[i]["contestId"];
			upHelper.contestRecord[contestId] = upHelper.contestRecord[contestId] || {
				contestName: "",
				cotestId: contestId,
				problemList: new Array(),
			};
			var len = upHelper.contestRecord[ contestId] [ "problemList" ].length;
			upHelper.contestRecord[ contestId ][ "problemList" ][ len ] = upHelper.problems[i] ;
		}

		// console.log(upHelper.contestRecord);

		$ajaxUtil.sendGetRequest(contestListURL, loadContestNames, true);
		// $ajaxUtil.sendGetRequest(userStatusURL + upHelper.userHandle, updateAC, true) ;
	}

	var updateUserHandle = function(response) {	//2

		if(response.status != "OK") return;
		upHelper.userHandle = response.result[0].handle;
		var htmlCode = getHTMLbySelector("h1");
		htmlCode = insertProperty(htmlCode, "handle_name", upHelper.userHandle);
		insertHTML("h1",htmlCode);
		insertHTML("h1 a",upHelper.userHandle);
		$ajaxUtil.sendGetRequest(problemsURL, loadProblems, true);	
	}

	document.addEventListener("DOMContentLoaded", function(event) {	//1

		function butttonClicked(event) {
			var inputHandle = document.querySelector("#inputHandle").value;
			// var inputHandle = "Rogue33";
			var newUserInfoURL = userInfoURL +  inputHandle;

			
			$ajaxUtil.sendGetRequest(newUserInfoURL, updateUserHandle, true);	
		}
		document.querySelector("button").addEventListener("click",butttonClicked);

	});

	global.$upHelper = upHelper;

})(window);