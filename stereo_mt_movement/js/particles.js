function ParticleManager(numberOfParticles) {
	this.numberOfParticles = numberOfParticles;
	this.particles = [];
	this.createParticles();
}

ParticleManager.prototype.createParticles = function() {
	for(var i = 0; i < this.numberOfParticles; i++) {
		this.particles.push(new Particle());
	}
}

ParticleManager.prototype.drawParticles = function() {
	for(var i = 0; i < this.numberOfParticles; i++) {
		this.particles[i].draw();
	}
}

ParticleManager.prototype.updateParticles = function(delta_t) {
	for(var i = 0; i < this.numberOfParticles; i++) {
		this.particles[i].update(delta_t);
	}
}

function Particle(position, speed, acceleration, color, life, fade) {
	this.position     = position;
	this.speed        = speed;
	this.acceleration = acceleration;
	this.color        = color;
	this.life         = life,
	this.fade         = fade;
}

Particle.prototype.draw = function() {
	
}