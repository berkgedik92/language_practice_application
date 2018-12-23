function Storage() {

	this.set = function(key, value, success) {
		NativeStorage.setItem(key, value, (success) ? success : dummySuccessFunc, errorFunc);
	}

	this.get = function(key, success, error) {
		NativeStorage.getItem(key, (success) ? success : dummySuccessFunc, (error) ? error : errorFunc);
	}

	this.remove = function(key, success, error) {
		NativeStorage.remove(key, (success) ? success : dummySuccessFunc, (error) ? error : errorFunc);
	}

	var errorFunc = function(error) {
		var silent = false;
		if (silent) return;
		switch (error.code) {
			case 1: alert("Unhandled storage exception : NATIVE_WRITE_FAILED");break;
			case 2: alert("Unhandled storage exception : ITEM_NOT_FOUND");break;
			case 3: alert("Unhandled storage exception : NULL_REFERENCE");break;
			case 4: alert("Unhandled storage exception : UNDEFINED_TYPE");break;
			case 5: alert("Unhandled storage exception : JSON_ERROR");break;
			default: alert("Unhandled storage exception : unknown exception"); break;
		}
	}

	var dummySuccessFunc = function(obj) {

	}
}