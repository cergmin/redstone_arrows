function union_arrays(x, y) {
	var obj = {};
	for (var i = x.length - 1; i >= 0; --i)
		obj[x[i]] = x[i];
	for (var i = y.length - 1; i >= 0; --i)
		obj[y[i]] = y[i];
	var res = []
	for (var k in obj) {
		if (obj.hasOwnProperty(k))  // <-- optional
			res.push(obj[k]);
	}
	return res;
}

Array.prototype.indexOf2D = function (a) {
	for (let i = 0; i < this.length; i++){
		let flag = true;
		for(let j = 0; j < this[i].length; j++){
			if (a[j] != this[i][j]){
				flag = false;
				break;
			}
		}
		if(flag){
			return i;
		}
	}
	return -1;
};

function onlyUnique(value, index, self) { // a.filter(onlyUnique);
	return self.indexOf(value) === index;
}

function onlyUnique2D(value, index, self) { // a.filter(onlyUnique2D);
	return self.indexOf2D(value) === index;
}

function normalize(x, y) {
	let vectorLength = x * x + y * y;

	return { 'x': x / vectorLength, 'y': y / vectorLength };
};