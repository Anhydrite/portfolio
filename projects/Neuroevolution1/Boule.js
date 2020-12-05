class boule {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
    }

    Mouvement() {

        if (this.x <= 0) {
            this.dx = -this.dx;
        }
        if (this.y <= 0) {
            this.dy = -this.dy;

        }

        if (this.x >= canvasWidth) {
            this.dx = -this.dx;
        }
        if (this.y >= canvasHeight) {
            // this.dy = -this.dy; 
            allCheck();
            this.dy = 0;
            this.dx = 0;
        }
        this.x += this.dx;
        this.y += this.dy;

    }

    Show() {
        stroke(255);
        fill(51);
        arc(this.x, this.y, this.radius, this.radius, 0, Math.PI * 2);
    }

    massiveThinkMoveDrawColli() {
        
        for (i = 0; i < PaTab.length; i++) {
                PaTab[i].think(Boule);
        }


        for (var w = 0; w < PaTab.length; w++) {

            if (this.x > PaTab[w].x && this.x < PaTab[w].x + PaTab[w].width && this.y > PaTab[w].y && this.y < PaTab[w].y + PaTab[w].height) {
                Highscore++;
                this.score++;

                allCheck();


                this.dy = -this.dy;
                this.y -= 10;

                if (this.dx < 0) {
                    this.dx -= 0;
                } else {
                    this.dx += 0;
                }
                if (this.dy < 0) {
                    this.dy -= 0;
                } else {
                    this.dy += 0;
                }
            }

        }
    }
}
