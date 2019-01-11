let token = config["token"];
let englishID = config["englishID"];
let swedishID = config["swedishID"];

//Get all words
let words = {};
$.ajax({
	url: "http://localhost:7000/api/words/load",
	beforeSend: function(request) {
	    request.setRequestHeader("Auth", token);
	},
	contentType: "application/json; charset=UTF-8",
	type: "GET",
	success: function(response) {
		for (let wordID in response)
			words[response[wordID]["name"]] = response[wordID];
	},
	error: function(response) {
		console.log("error");
		console.log(response);
	}
});

String.prototype.trim = function() 
{
    return String(this).replace(/^\s+|\s+$/g, '');
};

String.prototype.removeNonchars = function() {
	let temp = String(this).replace(/ *\([^)]*\) */g, "");
	return temp.replace(/[^a-zA-ZåäöÅÄÖ ]/gi, '');
}

function tryToParseEnglishMeaning(domElement) {

	let text = domElement.prevAll("h3")
					.eq(0)
					.nextAll("ol")
					.eq(0)
					.find("li").eq(0).text();

	text = text.replace(";", ",");
	text = text.split(",")[0];
	text = text.replace("an ", "");
	text = text.replace("a ", "");
	text = text.trim().removeNonchars();
	return text;
}

let formdata = new FormData();
let data = {};
let popup;
let popuptext;

$(document).ready(function(){

	popup = $("<div/>", {id: "popup"});
	popup.css("position", "fixed");
	popup.css("width", "50%");
	popup.css("height", "50%");
	popup.css("left", "25%");
	popup.css("top", "25%");
	popup.css("background", "rgba(200,0,0,0.5)");
	popup.css("display", "none");

	popuptext = $("<textarea/>");
	popuptext.css("position", "relative");
	popuptext.css("top", "10%");
	popuptext.css("position", "relative");
	popuptext.css("width", "80%");
	popuptext.css("height", "80%");
	popuptext.css("margin", "0 auto");

	let buttondiv = $("<div/>");
	buttondiv.css("position", "absolute");
	buttondiv.css("bottom", "0");

	let save = $("<input/>", {type: "button", value: "Save"});
	save.click(function() {
		data = JSON.parse(popuptext.val());
		formdata.append("data", JSON.stringify(data));

		$.ajax({
			url: "http://localhost:7000/api/words/save",
			beforeSend: function(request) {
			    request.setRequestHeader("Auth", token);
			},
			processData: false,
  			contentType: false,
			data: formdata,
			type: "POST",
			success: function(response) {
				alert("Successfully saved!");
				words[data["name"]] = {};
				console.log(response);
				popup.css("display", "none");
			},
			error: function(response) {
				alert("Could not save");
				console.log(response);
			}
		});
	});
	
	let cancel = $("<input/>", {type: "button", value: "Cancel"});
	cancel.click(function() {
		popup.css("display", "none");
	});
	
	buttondiv.append(save);
	buttondiv.append(cancel);

	popup.append(popuptext);
	popup.append(buttondiv);

	$("body").append(popup);

	if (window.location.href.indexOf("#") > 0)
		return;

	if ($("#Swedish").length === 0)
		return;

	$("html, body").animate({scrollTop: $("#Swedish").offset().top}, 1500);
});

$("tr").click(function() {
	let tableDOM = $(this).closest("table");

	//Detect if it is a noun/adjective/verb (0/1/2)
	let type;
	let first_row = tableDOM.find("tr").eq(0).text();
	data = {
		"level": 1,
		"categories": []
	};

	let swedishData = {};
	let englishMeaning;

	if (first_row.indexOf("Declension") >= 0) {
		type = 0;
		data["type"] = "NOUN";

		englishMeaning = tryToParseEnglishMeaning(tableDOM);

		if (words[englishMeaning]) {
			alert("This words has been already saved before!");
			return;
		}

		let r = tableDOM.find("tr").eq(3).find("td");

		swedishData = {
			"0" : $(r[1]).text().trim().removeNonchars(), //"hunden",
            "1" : $(r[3]).text().trim().removeNonchars(), //"hundarna",
            "2" : $(r[0]).text().trim().removeNonchars(), //"en hund",
            "3" : $(r[2]).text().trim().removeNonchars()  //"hundar"
		}

		if (swedishData["0"].lastIndexOf("n") === swedishData["0"].length - 1)
			swedishData["2"] = "en " + swedishData["2"];
		else if (swedishData["0"].lastIndexOf("t") === swedishData["0"].length - 1)
			swedishData["2"] = "ett " + swedishData["2"];
		else
			alert("we have a problem in nouns...");
	}
	else if (first_row.indexOf("Inflection") >= 0) {
		type = 1;
		data["type"] = "ADJECTIVE";

		englishMeaning = tryToParseEnglishMeaning(tableDOM);

		if (words[englishMeaning]) {
			alert("This words has been already saved before!");
			return;
		}

		let r1 = tableDOM.find("tr").eq(2).find("td").eq(0);
		let r2 = tableDOM.find("tr").eq(3).find("td").eq(0);
		let r3 = tableDOM.find("tr").eq(4).find("td").eq(0);

		swedishData = {
			"0" : r1.text().trim().removeNonchars(), //"röd",
            "1" : r2.text().trim().removeNonchars(), //"rött",
            "2" : r3.text().trim().removeNonchars()  //"röda"
		}
	}
	else {
		type = 2;
		data["type"] = "VERB";

		englishMeaning = tryToParseEnglishMeaning(tableDOM.closest("div.NavFrame").eq(0));

		if (words[englishMeaning]) {
			alert("This words has been already saved before!");
			return;
		}

		let r1 = tableDOM.find("tr").eq(1).find("td").eq(0);
		let r2 = tableDOM.find("tr").eq(2).find("td").eq(0);
		let r3 = tableDOM.find("tr").eq(3).find("td").eq(0);
		let r4 = tableDOM.find("tr").eq(4).find("td").eq(0);
		let r5 = tableDOM.find("tr").eq(5).find("td").eq(0);

		swedishData = {
			"0" : [r2.text().trim().removeNonchars()], //"är (Presens)",
            "1" : [r3.text().trim().removeNonchars()], //"var (Preteritum)",
            "2" : [r4.text().trim().removeNonchars()], //"varit (Perfekt)"
            "3" : [r1.text().trim().removeNonchars()], //"vara (Infinitiv)",
			"4" : [r5.text().trim().removeNonchars()]  //"var (Imperativ)",
		}
	}

	console.log("English = " + englishMeaning);

	//Detect English and Swedish of the word
	let current_url = window.location.href.split("/")
	let swedishMeaning = decodeURI(current_url[current_url.length - 1]);

	if (swedishMeaning.indexOf("#") > 0)
		swedishMeaning = swedishMeaning.substr(0, swedishMeaning.indexOf("#"));

	data["name"] = englishMeaning;
	data["meanings"] = {};
	data["meanings"][englishID] = englishMeaning;
	data["meanings"][swedishID] = swedishMeaning;
	data["data"] = {};
	data["data"][swedishID] = swedishData;

	formdata.append("editing", "false");
	formdata.append("pictureUploaded", "false");

	popup.css("display", "block");

	popuptext.val(JSON.stringify(data,null,2));
	console.log(data);
});