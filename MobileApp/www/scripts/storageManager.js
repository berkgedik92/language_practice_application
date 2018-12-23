function Storage() {

	this.set = function(key, value, success) {
		localStorage.setItem(key, value);
		if (success) 
			success();
	}

	this.get = function(key, success, error) {
		var data = localStorage.getItem(key);
		if (success && data) 
			success(data);
		if (error && !data) 
			error("null");
	}

	this.remove = function(key, success, error) {
		localStorage.removeItem(key);
		if (success) 
			success();
	}
}