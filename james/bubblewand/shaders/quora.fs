const vec3 COLOR = vec3(24.0, 202.0, 230.0) / 255.0;

const float WIDTH = 0.004;
const float MIDDLE = 0.5;

vec4 getProceduralColor() {

    float intensity = 0.0;
    float time = iGlobalTime / 5.0;
    vec3 position = _position.xyz * 1.5;
    for (int i = 0; i < 3; ++i) {
        float modifier = pow(2, i);
        vec3 noisePosition = position * modifier;
        float noise = snoise(vec4(noisePosition, time));
        noise /= modifier;
        intensity += noise;
    }
    intensity += 1.0;
    intensity /= 2.0;
    if (intensity > MIDDLE + WIDTH || intensity < MIDDLE - WIDTH) {
        discard;
    }
    return vec4(COLOR, 1);
}