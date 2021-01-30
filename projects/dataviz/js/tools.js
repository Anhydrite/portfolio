function getBlueToRed(percent) {
	let b = 255,
		r = 0;
	b -= percent * 2.5;
	r += percent * 5;
	b -= r;
	return 'rgb(' + r + ',' + 0 + ',' + b + ')';
}