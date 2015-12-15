var ON  = true, OFF = false;

function DirectionalLight(direction, color, state) {
	this.isEnabled = state;
	this.isLocal   = false;
	this.isSpot    = false;
	this.direction = direction;
	this.color     = color;
}

function PointLight(position, color, constantAttenuation, linearAttenuation, quadraticAttenuation, state) {
	this.isEnabled = state;
	this.isLocal   = true;
	this.isSpot    = false;
	this.position  = position;
	this.color     = color;

	this.constantAttenuation  = constantAttenuation;
	this.linearAttenuation    = linearAttenuation;
	this.quadraticAttenuation = quadraticAttenuation;
}

function SpotLight(position, direction, color, constantAttenuation, linearAttenuation, quadraticAttenuation, cutOff, exponent, state) {
	this.isEnabled = state;
	this.isLocal   = true;
	this.isSpot    = true;
	this.position  = position;
	this.direction = direction;
	this.color     = color;

	this.constantAttenuation  = constantAttenuation;
	this.linearAttenuation    = linearAttenuation;
	this.quadraticAttenuation = quadraticAttenuation;

	this.cutOff    = Math.cos(cutOff);
	this.exponent  = exponent;
}