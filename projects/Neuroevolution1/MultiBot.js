function allCheck() {
    for (z = PaTab.length - 1; z >= 0; z--) {
        if (Boule.x > PaTab[z].x && Boule.x < PaTab[z].x + PaTab[z].width && Boule.y > PaTab[z].y && Boule.y < PaTab[z].y + PaTab[z].height) {
            PaTab[z].score++;
        } else {
            PaTabDead.push(PaTab.splice(z, 1)[0]);
        }
        
    }
}




function Restart() {
    Generation++;
    if(Highscore>TotalHighscore)
    TotalHighscore=Highscore;
    Highscore=0;
    console.log("Generation up ! ");
    calculateFitness();
    for (let i = 0; i < PaddleTotal; i++) {
        PaTab[i] = pickOne();
    }
    PaTabDead = [];
    Boule = new boule(x, y, ballRadius);

}

function pickOne() {
    let index = 0;
    let r = random(1);
    while (r > 0) {
        r = r - PaTabDead[index].fitness;
        index++;
    }
    index--;
    let Paddel = PaTabDead[index];
    let child = new paddle(Paddel.brain);
    child.mutate();
    return child;
}

function calculateFitness() {
    let sum = 0;
    for (let Paddle of PaTabDead) {
        sum += Paddle.scoreFit;
    }
    for (let Paddle of PaTabDead) {
        Paddle.fitness = Paddle.scoreFit / sum;
    }
}