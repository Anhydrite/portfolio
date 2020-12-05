let slider;

function draw() {
	if (PaTab.length == 0) {
		Restart();
	}
	background(225);
	for (let i = 0; i <= slider.value(); i++) {
		Boule.Mouvement();
		Boule.massiveThinkMoveDrawColli();
		for (let Paddle of PaTab)
			Paddle.scoreFit++;
	}
	for (i = 0; i < PaTab.length; i++) {
		PaTab[i].drawPaddle();
	}

	Boule.Show();

	TextLast.innerHTML = "Bot restant : " + PaTab.length + "  Highscore : " + Highscore;
	TextGen.innerHTML = "Generation : " + Generation + " Best Highscore : " + TotalHighscore;

}


function setup() {
	createCanvas(canvasWidth, canvasHeight);
	slider = createSlider(1, 20, 0);
	creationPaddle();
	Boule = new boule(x, y, ballRadius);
}



jean.manger()
