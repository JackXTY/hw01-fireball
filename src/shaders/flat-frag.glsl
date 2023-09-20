#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

const float gridNum0 = 40.0; // accroding to vertical part
const float gridNum1 = 80.0; // accroding to vertical part
const float near = 0.1;
const float fovy = 0.7854;
const vec3 bound0 = vec3(0.08, 0.13, 0.17);
const vec3 bound1 = vec3(0.06, 0.1, 0.15);
const float TWO_PI = 6.2831853;
const float shineSpeed = 0.004;
vec3 baseCol0 = vec3(1.0, 1.0, 1.0); 
vec3 baseCol1 = vec3(0.5, 0.5, 0.5);

INCLUDE_TOOL_FUNCTIONS

vec3 star(vec3 ray, float gridNum, vec3 bound){
  // divide into 3D grid according to ray direction
  vec3 samplePos = ray * gridNum;
  vec3 gridID = floor(samplePos);
  vec3 guv = samplePos - gridID;
  guv = 2.0 * (guv - vec3(0.5)); // [-1, 1]
  // move the star, make it looks random
  vec3 shift = (random3(gridID) - vec3(0.5));
  float len = length(guv - shift);
  
  vec3 col = mix(baseCol0, baseCol1, smoothstep(bound.x, bound.y, len));
  col = mix(col, vec3(0.0), smoothstep(bound.y, bound.z, len));
  col *= 0.5 * (sin(u_Time * shineSpeed + TWO_PI * random(gridID)) + 1.0);
  return col;
}

void main() {

  vec3 u_Right = normalize(cross(u_Ref - u_Eye, u_Up));
  vec3 worldPos = normalize(u_Ref - u_Eye) * near + (tan(fovy / 2.0) * near * fs_Pos.y) * u_Up + (tan(fovy / 2.0) * near * (u_Dimensions.x / u_Dimensions.y) * fs_Pos.x) * u_Right;
  vec3 ray = normalize(worldPos);

  vec3 col = star(ray, gridNum0, bound0);
  col += star(ray, gridNum1, bound1);

  out_Col = vec4(col, 1.0);
}
