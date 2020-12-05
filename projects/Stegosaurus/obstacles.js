class obstacle {
	Move() {
		this.x -= vitesseDeplacement;
	}
}
class tonneau extends obstacle {
	constructor() {
		super();
		this.x = canvasWidth - 60;
		this.y = 440;
		this.x2 = 40;
		this.y2 = 140;
	}
	Draw() {
		fill(0, 255, 0);
		// rect(this.x, this.y, this.x2, this.y2);
		image(pillier, this.x, this.y, this.x2, this.y2);
	}
}
class buisson extends obstacle {
	constructor() {
		super();
		this.x = canvasWidth - 60;
		this.y = 500;
		this.x2 = 140;
		this.y2 = 80;
	}
	Draw() {
		fill(0, 0, 255);
		// rect(this.x, this.y, this.x2, this.y2);
		image(buissonimg, this.x, this.y, this.x2, this.y2);
	}
}
class pigeon extends obstacle {
	constructor() {
		super();
		this.x = canvasWidth - 60;
		this.y = 380;
		this.x2 = 80;
		this.y2 = 80;
	}
	Draw() {
		fill(0, 255, 0);
		// rect(this.x, this.y, this.x2, this.y2);
		image(pigeonimg, this.x, this.y, this.x2, this.y2);

	}
}
