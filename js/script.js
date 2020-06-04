(function (global) {

	var upHelper = {};


	document.addEventListener("DOMContentLoaded", function(event) {

		function getHandle(event) {
			var handle = document.querySelector("#handle").value;
			
			var cf = "https://codeforces.com/api/user.rating?handle=" +  handle;
			$ajaxUtil.sendGetRequest(cf, buildHTML, true);

			function buildHTML(returnData) {

				var htmlCode = "<h1>" + handle + "</h1>\n";

				htmlCode += "<ol>\n";
				for(var val in returnData.result) {
					var contestName = returnData.result[val].contestName;
					var rating = returnData.result[val].newRating - returnData.result[val].oldRating;

					var add = "";
					add += "\t<li>" + contestName + " ---------> " ;
					if(rating < 0 ) add += "<span class='red'>";
					else if( rating > 0 ) add += "<span class='green'>";
					add += rating ;
					add += "</span> </li>\n";

					htmlCode += add;

				}
				htmlCode += "</ol>\n"


				document.querySelector("#main-content").innerHTML = htmlCode;
				document.querySelector("input").value = "";

			}
		}

		document.querySelector("button").addEventListener("click",getHandle);

	});

	global.$upHelper = upHelper;

})(window);