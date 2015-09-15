const vec3 RED = vec3(1.0,0.0,0.0);
const vec3 GREEN = vec3(0.0,1.0,0.0);
const vec3 BLUE = vec3(0.0,0.0,1.0);

vec4 getProceduralColor(){

	vec3 color = _position.xyz;
	color = normalize(color);
	color = abs(color);

	return vec4(color,1.0);

	//vec3 color = BLUE;
	// float intensity = sin(iGlobalTime * 3.14159 * 2.0);
	// intensity += 1.0;
	// intensity /=2.0;
	// color *= intensity;

	
}