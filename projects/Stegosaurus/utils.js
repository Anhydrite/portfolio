document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
	if (e.key == " " || e.key == "Space") {
		spacePressed = true;
	}
}

function keyUpHandler(e) {
	if (e.key == " " || e.key == "Space") {
		spacePressed = false;
	}
}
