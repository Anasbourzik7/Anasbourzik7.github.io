
// Define the Obstacle class
class Obstacle {
    constructor(x, y, radius, img) {
      this.position = createVector(x, y);
      this.radius = radius;
      this.img = img; // store the image
    }
  
    show() {
      // Display the obstacle image at the position
      imageMode(CENTER);
      image(this.img, this.position.x, this.position.y, this.radius * 2, this.radius * 2);
    }
  }
