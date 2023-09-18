vec3 random3(vec3 pos){
    return fract(vec3(
        9175.3f * cos(dot(pos, vec3(135.235f, 593.3f, -354.1f))), 
        124.9f * sin(dot(pos, vec3(937.1f, -2031.1f, 24.6f))), 
        -1234.62f * sin(dot(pos, vec3(-752.91f, -468.57f, 462.24f)))
    ));
}

float random(vec3 pos){
    return fract(
        672.75f * cos(dot(pos, vec3(7092.71f, -641.3f, 2584.1f)))
    );
}

float random(float p){
    return fract(
        76.9f * sin(672.75f * cos(p * 726.257f) + 981.52f)
    );
}

float surflect3D(vec3 grid, vec3 pos)
{
    vec3 diff = grid - pos;
    vec3 grad = 2.0f * random3(grid) - vec3(1.0f, 1.0f, 1.0f);
    float tx = 6.0f * pow(abs(diff.x), 5.0f) - 15.0f * pow(abs(diff.x), 4.0f) + 10.0f * pow(abs(diff.x), 3.0f);
    float ty = 6.0f * pow(abs(diff.y), 5.0f) - 15.0f * pow(abs(diff.y), 4.0f) + 10.0f * pow(abs(diff.y), 3.0f);
    float tz = 6.0f * pow(abs(diff.z), 5.0f) - 15.0f * pow(abs(diff.z), 4.0f) + 10.0f * pow(abs(diff.z), 3.0f);
    return dot(diff, grad) * (1.0f - tx) * (1.0f - ty) * (1.0f - tz);
}

float perlinNoise(vec3 pos){
    float sum = 0.0f;
    for(int dx = 0; dx <= 1; dx++){
        for(int dy = 0; dy <= 1; dy++){
            for(int dz = 0; dz <= 1; dz++){
                float surf = surflect3D(floor(pos + vec3(0.001f, 0.001f, 0.001f)) + vec3(dx, dy, dz), pos);
                sum += surf;
            }
        }
    }
    return sum;
}

float worleyNoise(vec3 pos){
    float sum = 0.0f;
    float minDis = 1.0f;
    for(int dx = -1; dx <= 1; dx++){
        for(int dy = -1; dy <= 1; dy++){
            for(int dz = -1; dz <= 1; dz++){
                vec3 grid = floor(pos + vec3(0.001f, 0.001f, 0.001f) + vec3(dx, dy, dz));
                float dis = length(grid + random3(grid) - pos);
                minDis = min(dis, minDis);
            }
        }
    }
    return 1.0f - minDis;
}
