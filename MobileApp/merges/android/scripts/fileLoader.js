var urlPrefix;

var fileSystem;
var fileTransferObj;

var folders = ["language/",
               "language/icons/",
               "language/users/",
               "language/words/",
               "language/languages/",
               "language/categories/"];

function SetFileLoaderURL(url) {
    urlPrefix = url + "langapp/";
}

let folderCounter = 0;
let fileCounter = 0;

function CreateFolders(callback) {
    if (folderCounter == folders.length) {
        callback();
        return;
    }

    fileSystem.getDirectory(folders[folderCounter], 
                            {create: true, exclusive: false}, 
                            function(dirEntry) {

        folderCounter += 1;
        CreateFolders(callback);

    }, function(errorData) {
        if (errorData.code == 12) {
            console.log("Folder already exists " + folders[folderCounter]);
            folderCounter += 1;
            CreateFolders(callback);
        }
        else {
            alert("Error on CreateFolders function!");
            error(errorData);
        }
    });
}

function FileSystemInit(callback) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
        fileSystem = dirEntry;
        fileTransferObj = new FileTransfer();
        console.log("fileSystem and fileTransferObj objects are ready");
        CreateFolders(callback);
    }, function(errorData) {
        alert("Error on FileSystemInit!");
        error(errorData);
    });
}

function SetPicture(img, url) {
    if (url && url.length > 0)
        img.style["background-image"] = "url('" + fileSystem.nativeURL + url + "')";
    else
        img.style["background-image"] = "";
}

function LoadPictures(arr, callback) {
    if (fileCounter == arr.length) {
        callback();
        return;
    }

	CheckIfFileExists(arr[fileCounter], function(fileEntry) {
    	//If the picture with this URL does not exist...
        if (!fileEntry) {
            /*
            	...First check if an old version exists, 
            	if it exists, delete it...
            */
            let url = arr[fileCounter];
            let extension = url.substr(url.indexOf(".") + 1);
            let urlParts = url.substr(0, url.indexOf(".")).split('_');
            let index = parseInt(urlParts[1]);
            if (index > 0)
            {
                let oldFile = urlParts[0] + "_" + (index - 1) + "." + extension;
                CheckIfFileExists(oldFile, function(oldFileEntry){
                    if (oldFileEntry) {
                        RemoveFile(oldFileEntry, function() {
                            LoadPictures(arr, callback);
                        });
                    }
                });
            }

            /*
				...Then, download the picture specified by the URL
            */
            fileTransferObj.download(encodeURI(urlPrefix + url), cordova.file.dataDirectory + url, function(entry) {
                console.log("Picture with url " + url + " is downloaded...");
                fileCounter += 1;    
                LoadPictures(arr, callback);
            }, function(error) {
            	console.log("Error when downloading picture (url = " + url + "), error " + error);
                fileCounter += 1;
                LoadPictures(arr, callback);
  
            });
        }
        //If the picture with this URL already exists do nothing.
        else {
            fileCounter += 1; 
            LoadPictures(arr, callback);
        }
        console.log("Picture " + fileCounter + " is loaded...");
    });
}

function RemoveFile(fileEntry, callback) {
    fileEntry.remove(function() {
        console.log('File removed');
        callback();
    }, error);
}

function ReadFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read : " + this.result);
        };

        reader.readAsText(file);
    }, error);
}

function CreateFile(fileName, data, callback) {
	fileSystem.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write");
                callback(true);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write : " + e.toString());
                callback(false);
            };

            fileWriter.write(data);
        });
    }, error);
}

function CheckIfFileExists(fileName, callback) {
    fileSystem.getFile(fileName, {create: false}, function(fileEntry) {
        callback(fileEntry);
    }, function(e) {
        callback(null);
    });
}

var error = function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error ' + e;
            break;
    };

    console.log('Error: ' + msg);
}