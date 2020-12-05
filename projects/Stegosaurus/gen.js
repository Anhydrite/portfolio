function Restartt() {
	vitesseDeplacement = Vitesseinitial;
	Generation++;
	compteur = 0;
	console.log("Generation Up !");
	calculateFitness();
	for (let i = 0; i < StegoTotal; i++) {
		Stegosaurus[i] = pickOne();
	}
	ExterminatedStegosaurus = [];
	Obstacles = [];
	Obstacles[0] = new tonneau();

}

function calculateFitness() {
	let sum = 0;
	for (let stegosaurus of ExterminatedStegosaurus) {
		sum += stegosaurus.score;
		if (stegosaurus.score > HighestScore) {
			HighestScore = stegosaurus.score;
		}
	}
	for (let stegosaurus of ExterminatedStegosaurus) {
		stegosaurus.fitness = stegosaurus.score / sum;
	}
}

function pickOne() {
	let index = 0;
	let r = random(1);
	while (r > 0) {
		r = r - ExterminatedStegosaurus[index].fitness;
		index++;
	}
	index--;
	let ste = ExterminatedStegosaurus[index];
	let child = new stegosaurus(ste.brain);
	child.mutate();
	return child;
}
