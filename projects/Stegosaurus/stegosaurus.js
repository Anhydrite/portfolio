class stegosaurus {
	constructor(brain) {
		this.x = 80;
		this.y = 500;
		this.jumping = 0;
		this.saut = false;
		this.hauteur = 250;
		this.fitness = 0;
		this.score = 0;
		if (brain) {
			this.brain = brain.copy();
		} else {
			this.brain = new NeuralNetwork(4, 64, 1);
		}
	}
	Draw() {
		fill(255, 0, 0, 10);
		// rect(this.x, this.y - this.jumping, 80, 80);
		image(stegoimg, this.x, this.y - this.jumping, 80, 80);
	}
	Jump() {
		if (this.saut == false && this.jumping == 0) {
			this.saut = true;
		}
	}
	Move() {

		if (this.saut == true) {
			this.jumping += this.hauteur / (5 + this.jumping / 10);
			if (this.jumping >= this.hauteur) {
				this.saut = false;
			}
		} else {
			this.jumping -= this.hauteur / 10;
			if (this.jumping <= 0) {
				this.jumping = 0;
				return;
			}
		}
	}
	mutate() {
		this.brain.mutate(0.1);
	}
	think() {
		let inputs = [];
		inputs[0] = Obstacles[0].x;
		inputs[1] = Obstacles[0].y;
		inputs[2] = this.x;
		inputs[3] = this.y;
		let output = this.brain.predict(inputs);
		if (output[0] > 0.5) {
			this.Jump();
		}
	}


}
