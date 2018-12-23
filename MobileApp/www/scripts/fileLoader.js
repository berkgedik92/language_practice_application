var urlPrefix;
var pictureToLoad = [];

function SetFileLoaderURL(url) {
	urlPrefix = url + "langapp/";
}

function FileSystemInit(callback) {
	callback();
}

function SetPicture(img, url) {
	if (url && url.length > 0)
		img.style["background-image"] = "url('" + urlPrefix + url +"')";
	else
		img.style["background-image"] = "";
}

function LoadPictures(pictureURLArray, callback) {
	callback();
}