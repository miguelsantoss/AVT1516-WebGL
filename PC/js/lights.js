var ON  = true, OFF = false;

function DirectionalLight(direction, ambient, diffuse, specular, state) {
	this.isEnabled = state;
	this.isLocal   = false;
	this.isSpot    = false;
	this.direction = direction;

	this.ambient   = ambient;
	this.diffuse   = diffuse;
	this.specular  = specular;
}

function PointLight(position, ambient, diffuse, specular, constantAttenuation, linearAttenuation, quadraticAttenuation, state) {
	this.isEnabled = state;
	this.isLocal   = true;
	this.isSpot    = false;
	this.position  = position;

	this.ambient   = ambient;
	this.diffuse   = diffuse;
	this.specular  = specular;

	this.constantAttenuation  = constantAttenuation;
	this.linearAttenuation    = linearAttenuation;
	this.quadraticAttenuation = quadraticAttenuation;
}

function SpotLight(position, direction, ambient, diffuse, specular, constantAttenuation, linearAttenuation, quadraticAttenuation, cutOff, exponent, state) {
	this.isEnabled = state;
	this.isLocal   = true;
	this.isSpot    = true;
	this.position  = position;
	this.direction = direction;

	this.ambient   = ambient;
	this.diffuse   = diffuse;
	this.specular  = specular;

	this.constantAttenuation  = constantAttenuation;
	this.linearAttenuation    = linearAttenuation;
	this.quadraticAttenuation = quadraticAttenuation;

	this.cutOff    = Math.cos(cutOff);
	this.exponent  = exponent;
}