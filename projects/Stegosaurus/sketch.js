function preload() {
	stegoimg = loadImage("./steg.png");
	pillier = loadImage("./pillier.png");
	pigeonimg = loadImage("./pigeon.png");
	buissonimg = loadImage("./buisson.png");
	fond = loadImage("./fond.png");
}

function setup() {
	createCanvas(canvasWidth, canvasHeigth);
	for (let i = 0; i < StegoTotal; i++) {
		Stegosaurus[i] = new stegosaurus();
	}
	Obstacles[0] = new tonneau();
	// video = createVideo("test.webm");
	// video2 = createVideo("test2.mp4");
	// video3 = createVideo("test3.mp4");
	// video3.loop();
	// video3.hide();
	// video2.loop();
	// video2.hide();
	// video.loop();
	// video.hide();
	slider = createSlider(0, 20, 1);
}



function draw() {
	// background(150);
	image(fond, 0, 0, canvasWidth, canvasHeigth);

	for (let i = 0; i < slider.value(); i++) {
		if (!Stegosaurus[0]) {
			Restartt();
		}
		//ROUTINE
		compteur += 3;
		if (vitesseDeplacement > Vitesseinitial * 2.5 + 3) {
			vitesseDeplacement = Vitesseinitial * 2.5 + 3;
		}
		vitesseDeplacement += 0.01;
		if (compteur % (35) == 0) {
			let rand = random(0, 4);
			if (rand > 3) {
				Obstacles.push(new buisson());
			} else if (rand > 2) {
				Obstacles.push(new tonneau());
			} else if (rand > 1) {
				Obstacles.push(new pigeon());
			}
		}
		for (let stegosaurus of Stegosaurus) {
			stegosaurus.score += 3;
			if (Obstacles[0])
				stegosaurus.think();
		}
		//DESTRUCTION OBSTACLES
		for (let obstacle of Obstacles) {
			if (obstacle.x < 0) {
				Obstacles.splice(0, 1);
			}
			obstacle.Move();
		}
		//DESTRUCTION JOUEURS
		for (let i = Stegosaurus.length - 1; i >= 0; i--) {
			Stegosaurus[i].Move();
			for (let obstacle of Obstacles) {
				if (collideRectRect(Stegosaurus[i].x, Stegosaurus[i].y - Stegosaurus[i].jumping, 80, 80, obstacle.x, obstacle.y, obstacle.x2, obstacle.y2)) {
					ExterminatedStegosaurus.push(Stegosaurus.splice(i, 1)[0]);
					break;
				}
			}
		}
	}
	//Drawing stuff
	Score = compteur;
	document.getElementById('board').innerHTML = "Generation : " + Generation + " Score actuelle " + Score + " Score max : " + HighestScore + " Stegosaurus restants : " + Stegosaurus.length;
	for (let stegosaurus of Stegosaurus) {
		stegosaurus.Draw();
	}
	line(0, 580, canvasWidth, 580);
	for (let obstacle of Obstacles) {
		obstacle.Draw();
	}

	//MANUAL CONTROL
	// if (spacePressed) {
	// 	Stegosaurus[0].Jump();
	// }

}
