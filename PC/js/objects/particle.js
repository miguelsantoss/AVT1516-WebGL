function Particle(position, acc, color, life, fade) {
	this.position = position;
	this.acc = acc;
	this.color = color;
	this.life = life;
	this.face = fade;

	var v = generateRandomNumber(0.2, 1);
	var phi = Math.random() * Math.PI;
	var theta = Math.random() * Math.PI * 2;
	this.speed = [v*Math.cos(theta)*Math.sin(phi), v*Math.cos(phi), v*Math.sin(theta)*Math.sin(phi)];
}

Particle.prototype.update = function(delta_t) {
	this.position[0] = this.position[0] + this.speed[0]*delta_t;
	this.position[1] = this.position[1] + this.speed[1]*delta_t;
	this.position[2] = this.position[2] + this.speed[2]*delta_t;

	this.speed[0] = this.speed[0] + this.acc[0]*delta_t;
	this.speed[1] = this.speed[1] + this.acc[1]*delta_t;
	this.speed[2] = this.speed[2] + this.acc[2]*delta_t;

	this.life -= this.fade;
}

Particle.prototype.draw = function() {
	
}