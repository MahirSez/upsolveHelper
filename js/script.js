(function (global) {

	var upHelper = {};

	var cf = "https://codeforces.com/api/user.rating?handle=Rogue33"
	document.addEventListener("DOMContentLoaded", function(event) {


		$ajaxUtil.sendGetRequest(cf, buildHTML, true);

		function buildHTML(returnData) {

			// console.log(returnData);

			var htmlCode = "<ol>\n";
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

			// console.log(htmlCode);

			document.querySelector("#main-content").innerHTML = htmlCode;
			document.querySelector("h1").innerHTML = "Rogue33";

		}




	});

	global.$upHelper = upHelper;

})(window);