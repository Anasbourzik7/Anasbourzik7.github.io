// Equivalent du tableau de véhicules dans les autres exemples
const flock = [];
let vehicules = [];
let obstacles = [];
let pursuer1;
let boidImage;
let diddyimage;
let obstacleImg;
let followerImage; // Image des poursuivants
let alignSlider, cohesionSlider, separationSlider;
let labelNbBoids;
let target;
let diddy;
let mode = "default"; // Le mode commence par défaut

// Variables pour suivre l'état de la position du curseur
let previousMousePosition;

// PRELOAD
function preload() {
  // On charge une image de poisson
  boidImage = loadImage('assets/boids/justin_bieber.png');
  diddyimage = loadImage('assets/leader/diddy.png');
  followerImage = loadImage('assets/followers/police.jpg');
  obstacleImg = loadImage('assets/obstacle/fbi.png');
}

// SETUP
function setup() {
  createCanvas(1600, 800);

  // Initialisation de la position précédente de la souris
  previousMousePosition = createVector(mouseX, mouseY);

  // Create an obstacle at the center of the screen
  obstacles.push(new Obstacle(width / 2, height / 2, 100, obstacleImg));

  // Ajouter un véhicule de départ
  pursuer1 = new Vehicle(100, 100, followerImage);
  vehicules.push(pursuer1);

  const posYSliderDeDepart = 10;
  creerUnSlider("Vitesse Justin bieber", flock, 0, 40, 3, 0.1, 10, posYSliderDeDepart + 10, "maxSpeed");
  creerUnSlider("Size Justin Bieber", flock, 4, 40, 6, 1, 10, posYSliderDeDepart + 40, "r");

  // Créer les "boids"
  for (let i = 0; i < 20; i++) {
    const b = new Boid(random(width), random(height), boidImage);
    b.r = 30;
    b.maxSpeed = 5; // Vitesse initiale réglée à 3

    flock.push(b);
  }

  // Checkbox pour debug on/off
  debugCheckbox = createCheckbox('Debug ', false);
  debugCheckbox.position(3, 125);
  debugCheckbox.style('color', 'white');

  debugCheckbox.changed(() => {
    Boid.debug = !Boid.debug;
  });

  // Créer un label avec le nombre de boids
  labelNbBoids = createP("Nombre de boids : " + flock.length);
  labelNbBoids.style('color', 'white');
  labelNbBoids.position(10, posYSliderDeDepart + 70);

  // Diddy prédateur
  diddy = new Boid(width / 2, height / 2, diddyimage);
  diddy.r = 60;
  diddy.maxSpeed = 7;
  diddy.maxForce = 0.5;
}

// CREER SLIDER
function creerUnSlider(label, tabVehicules, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);

  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    tabVehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });

  return slider;
}

// DRAW
function draw() {
  background(150);

  // Mise à jour du nombre de boids
  labelNbBoids.html("Nombre de boids : " + flock.length);

  // Draw the obstacles
  obstacles.forEach(o => {
    o.show();
  });

  // Vérifier si le curseur s'est déplacé
  let cursorStopped = previousMousePosition.x === mouseX && previousMousePosition.y === mouseY;

  // Mode SNAKE
  vehicules.forEach((vehicule, index) => {
    let steeringForce;
    switch(mode) {
      case "snake":
        if (index === 0) {
          // Le premier véhicule suit la position de diddy
          steeringForce = vehicule.arrive(diddy.pos, 30);
        } else {
          // Les autres suivent le véhicule précédent
          let vehiculePrecedent = vehicules[index - 1];
          steeringForce = vehicule.arrive(vehiculePrecedent.pos, 40);
        }
        break;
      case "default":
        // Mode "texte", suivre la position de diddy
        let targetTexte = createVector(diddy.pos.x, diddy.pos.y); // Utilisation de diddy.pos
        steeringForce = vehicule.arrive(targetTexte, 0);
        break;
    }

    vehicule.applyForce(steeringForce);
    vehicule.update();
    vehicule.show();
  });

  // Diddy suit la souris
  diddy.pos.x = mouseX;
  diddy.pos.y = mouseY;

  image(diddyimage, diddy.pos.x - diddy.r / 2, diddy.pos.y - diddy.r / 2, diddy.r, diddy.r);

  // Diddy mange les boids
  for (let i = flock.length - 1; i >= 0; i--) {
    let boid = flock[i];
    let d = p5.Vector.dist(diddy.pos, boid.pos);
    if (d < diddy.r / 2) {
      flock.splice(i, 1);
    }
  }

  // Dessiner les boids
  for (let boid of flock) {
    boid.flock(flock);
    boid.fleeWithTargetRadius(diddy.pos); // Les boids fuient aussi la position de diddy
    boid.update();
    boid.show();
  }

  // Mise à jour de la position précédente du curseur
  previousMousePosition.set(mouseX, mouseY);
}

// KEY
function keyPressed() {
  if (key === 'd') {
    Boid.debug = !Boid.debug;
  } else if (key === "v") {
    vehicules.push(new Vehicle(random(width), random(height), followerImage));
  } else if (key === "f") {
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(random(20, width - 20), random(20, height - 20), followerImage);
      v.vel = createVector(random(1, 5), random(1, 5));
      vehicules.push(v);
    }
  } else if (key === 'b') {
    let newBoid = new Boid(random(width), random(height), boidImage);
    newBoid.r = 30;
    flock.push(newBoid);
  } else if (key === 's') {
    // Basculer entre les modes "default" et "snake"
    mode = (mode === "default") ? "snake" : "default";
  } else if (key === 'o') {
    // création d'obstacle aléatoire + taille aléatoire
    let randomX = random(width);
    let randomY = random(height);
    let randomSize = random(20, 100);  // Taille aléatoire 
    obstacles.push(new Obstacle(randomX, randomY, randomSize, obstacleImg));
  }
}
