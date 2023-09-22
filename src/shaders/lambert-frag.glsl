#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color0; // The color with which to render this instance of geometry.
uniform vec4 u_Color1;
uniform float u_NoiseFrequency;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos; // in object space
in vec4 fs_Wpos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

INCLUDE_TOOL_FUNCTIONS

float smootherstep(float edge0, float edge1, float x)
{
    x = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);
    return x*x*x*(x*(x*6.0 - 15.0) + 10.0);
}

float fbmPerlin(vec3 pos, int iteration){
    float amp = 0.5f;
    float freq = 1.0f;
    float res = 0.0f;
    for(int i = 0; i < 3; i++)
    {
        // noise += amp * 0.7f * clamp(perlinNoise(pos * 3.0f * freq) + 0.5f, 0.0f, 1.0f);
        // noise += amp * worleyNoise(pos * 2.5f * freq);
        res += amp * (1.0f - abs(perlinNoise(pos * freq)));
        freq *= 2.0f;
        amp /= 2.0f;
    }
    return res;
}

void main()
{
    vec3 col = vec3(0.0f, 0.0f, 0.0f);
    // col += 0.5f * worleyNoise(fs_Pos.xyz * 2.5f) * u_Color.xyz;

    float noise = fbmPerlin(normalize(fs_Pos.xyz) * u_NoiseFrequency, 3);
    float heightFactor = 1.0f + 2.0f * smootherstep(2.0f, 5.0f, length(fs_Pos.xyz));
    col += mix(u_Color0.rgb, u_Color1.rgb, noise) * heightFactor;
    
    out_Col = vec4(col, 1.0f);
}
