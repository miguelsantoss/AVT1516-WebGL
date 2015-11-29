function GameManager(width, height) {
	this.width = width;
	this.height = height;

	this.cameras = [];
	this.activeCamera = 1;
	this.cameras.push(new OrthogonalCamera(-5, 65, -5, 65, -10, 10));
	this.cameras.push(new PerspectiveCamera(70, this.width / this.height, 0.1, 100, [0, 1, 0], [1, 1, 1]));

	this.car = new Car([28.7, 1.15, 6.1], [1.0, 0.0, 0.0]);
}

GameManager.prototype.activeCameraProj = function() {
	this.cameras[this.activeCamera].computeProjection();
}

GameManager.prototype.changeActiveCamera = function(newActive) {
	this.activeCamera = newActive;
}

GameManager.prototype.render = function() {

}

GameManager.prototype.updatePerspectiveCamera = function() {
	var newPosition = [this.car.position[0] - 2 * this.car.direction[0], this.car.position[1] + 1, this.car.position[2] - 2 * this.car.direction[2]];
	var newDirection   = [this.car.position[0] + 5 * this.car.direction[0] - this.cameras[1].camX * this.car.direction[0], this.car.position[1] - this.cameras[1].camY, this.car.position[2] + 5 * this.car.direction[2] - this.cameras[1].camZ * this.car.direction[2]];
	this.cameras[1].updateLookAt(newPosition, newDirection);
}

GameManager.prototype.drawObjects = function() {
	this.car.draw();
}

GameManager.prototype.updateObjs = function(delta_t) {
	this.car.update(delta_t);
}