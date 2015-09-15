// Fresnel example fragment shader

// lighting parameters in view space
varying vec4 V;			// vertex position
varying vec4 E;			// eye position
varying vec3 N;			// surface normal

// direction of brightest point in environment map
const vec3 Ln = vec3(-.913, 0.365, 0.183);
uniform sampler2D env;

// lighting parameters -- could pass in as uniform
const float r0 = .1;		// Fresnel reflectance at zero angle
const vec4 ka = vec4(.1,.2,.3,1);
const vec4 kd = vec4(.5,.7,.9,0);
const vec4 ks = vec4(.4,.4,.4,0);
const float es = 16.;

void
main()
{
    // lighting vectors
    vec3 Nn = normalize(N);	// normal
    vec3 In = normalize(V.xyz*E.w - E.xyz*V.w); // -view
    vec3 Hn = normalize(Ln-In);	// half way between view & light

    // color
    float diff = max(0.,dot(Nn,Ln));
    float spec = pow(max(0.,dot(Nn,Hn)),es);
    vec4 col = ka + kd*diff + ks*spec;

    vec3 R = reflect(In,Nn);
    vec3 RH = normalize(R-In);
    float fresnel = r0 + (1.-r0)*pow(1.+dot(In,RH),5.);
    vec4 env = texture2D(env, .5+.5*normalize(R+vec3(0,0,1)).xy);

    gl_FragColor = mix(col,env,fresnel);
}
