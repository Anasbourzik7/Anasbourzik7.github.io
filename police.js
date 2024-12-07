class Vehicle {
  static debug = false;

  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 10;
    this.maxForce = 0.6;
    this.r = 16; // Rayon de référence
    this.rayonZoneDeFreinage = 100;
    this.img = img;  // L'image du véhicule
    this.scale = 2;  // Facteur d'échelle pour l'image
  }

  // Fonction pour éviter les obstacles
  avoidObstacles(obstacles) {
    let steeringForce = createVector(0, 0);
    let total = 0;

    // Détecter chaque obstacle et calculer une force d'évitement
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i];
      let d = p5.Vector.dist(this.pos, obstacle.pos);

      // Si l'obstacle est trop proche
      if (d < this.rayonZoneDeFreinage + obstacle.r) {
        let diff = p5.Vector.sub(this.pos, obstacle.pos); // Force d'évitement
        diff.normalize();
        diff.div(d);  // Plus l'obstacle est proche, plus la force est grande

        steeringForce.add(diff);
        total++;
      }
    }

    // Si des obstacles ont été détectés, calculer la force moyenne
    if (total > 0) {
      steeringForce.div(total);
      steeringForce.setMag(this.maxSpeed); // Appliquer la vitesse maximale
      steeringForce.sub(this.vel);  // Calculer la différence avec la vitesse actuelle
      steeringForce.limit(this.maxForce);  // Limiter la force d'évitement
    }

    return steeringForce;
  }

  // Fonction pour éviter un autre véhicule
  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  // Fonction pour poursuivre un véhicule
  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }


  arrive(target, slowingRadius) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    if (d < slowingRadius) {
      let m = map(d, 0, slowingRadius, 0, this.maxSpeed);
      desired.setMag(m);
    } else {
      desired.setMag(this.maxSpeed);
    }
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }
  
  fleeWithTargetRadius(target) {
    let desired = p5.Vector.sub(this.pos, target);
    let d = desired.mag();
    if (d < this.r) {
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }
  
  // Fonction pour arriver à un objectif
  arrive(target, d = 0) {
    return this.seek(target, true, d);
  }

  // Fonction pour fuir un objectif
  flee(target) {
    return this.seek(target.pos).mult(-1);
  }

  // Fonction pour se diriger vers un objectif
  seek(target, arrival = false, d = 0) {
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    let desiredSpeedMagnitude = this.maxSpeed;

    if (arrival) {
      if (Vehicle.debug) {
        noFill();
        stroke("white")
        circle(target.x, target.y, this.rayonZoneDeFreinage * 2);
      }

      const dist = p5.Vector.dist(this.pos, target);
      if (dist < this.rayonZoneDeFreinage) {
        desiredSpeedMagnitude = map(dist, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    desiredSpeed.setMag(desiredSpeedMagnitude);
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);

    if (Vehicle.debug) {
      stroke("green");
      line(this.pos.x, this.pos.y, this.pos.x + force.x * 10, this.pos.y + force.y * 10);
    }

    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    imageMode(CENTER);
    image(this.img, this.pos.x, this.pos.y, this.r * 6, this.r * 6);
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}
