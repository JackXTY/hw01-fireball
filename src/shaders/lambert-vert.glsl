#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

uniform float u_Time;

uniform float u_ShiftScale;
uniform float u_ShiftFreq;
uniform float u_ShiftSpeed;
uniform float u_ShiftSmoothness;
uniform float u_DetailFreq;
uniform float u_DetailScale;

in vec4 vs_Pos;             // The array of vertex positions passed to the shader

in vec4 vs_Nor;             // The array of vertex normals passed to the shader

in vec4 vs_Col;             // The array of vertex colors passed to the shader.

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Pos;
out vec4 fs_Wpos;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.

#define TWO_PI 6.283185f

INCLUDE_TOOL_FUNCTIONS

float impulse(float k, float x)
{
    float h = k * x;
    return h * exp(1.0 - h);
}

float parabola(float x, float k)
{
    return pow(4.0*x*(1.0-x), k);
}

float shiftVertex(vec3 pos, float freq, float scale, float time, float speed, float smoothness)
{
    pos += vec3(897.0f, 134.8f, -234.9f);
    pos *= freq;
    pos += vec3(sin(time * speed));
    pos = sin(pos + 0.5f * cos(pos + 2.0f * sin(pos)));
    float d = dot(vec3(1.0f), pos);
    // return (sin(d) + 1.0f) * scale * 0.5f;
    d = (sin(d) + 1.0f) * 0.5f;
    d = parabola(d / 2.0, smoothness);
    return d * scale;
}

float fbmWorley(vec3 pos, int iteration){
    float amp = 0.5f;
    float freq = 1.0f;
    float res = 0.0f;
    for(int i = 0; i < 3; i++)
    {
        // noise += amp * 0.7f * clamp(perlinNoise(pos * 3.0f * freq) + 0.5f, 0.0f, 1.0f);
        // noise += amp * worleyNoise(pos * 2.5f * freq);
        res += amp * (1.0f - abs(worleyNoise(pos * freq)));
        freq *= 2.0f;
        amp /= 2.0f;
    }
    return res;
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);
    // Pass the vertex normals to the fragment shader for interpolation.
    // Transform the geometry's normals by the inverse transpose of the
    // model matrix. This is necessary to ensure the normals remain
    // perpendicular to the surface after the surface is transformed by
    // the model matrix.

    // cogigs, to be binded with gui
    // const float u_ShiftScale = 0.5f;
    // const float u_ShiftFreq = 6.0f;
    // const float u_ShiftSpeed = 0.1f;
    // const float u_ShiftSmoothness = 0.6f;

    // const float u_DetailFreq = 15.0f;
    // const float u_DetailScale = 0.1f;

    vec3 dir = normalize(fs_Nor.xyz);
    float t = TWO_PI * random(vs_Pos.xyz) + u_Time;
    vec3 pos = vs_Pos.xyz;

    // basic shift, with sin & cos
    pos = pos + dir * shiftVertex(pos, u_ShiftFreq, u_ShiftScale, t, u_ShiftSpeed, u_ShiftSmoothness);
    // detail shift, with noise (fbm)
    float tr = 0.5f + 0.5f * sin(t + cos(t));
    pos += u_DetailScale * fbmWorley(vs_Pos.xyz * u_DetailFreq, 3) * dir * tr;
    //pos += detailScale * worleyNoise(vs_Pos.xyz * detailFreq) * dir * tr;

    fs_Pos = vec4(pos, 1.0f);
    vec4 modelposition = u_Model * vec4(pos, 1.0f);   // Temporarily store the transformed vertex positions for use below
    fs_Wpos = modelposition;

    fs_LightVec = lightPos - modelposition;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}
