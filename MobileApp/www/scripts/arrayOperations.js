Array.prototype.remove = function(a) {
    return this.splice(this.indexOf(a), 1);
};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if (i == 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}

Array.prototype.deepCopy = function() {
    return JSON.parse(JSON.stringify(this));
}

Object.prototype.deepCopy = function() {
    return JSON.parse(JSON.stringify(this));
}