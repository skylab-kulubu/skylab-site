export const UNIVERSE_SHADER_HIGH = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float u_speed;
uniform float u_density;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_seed;
uniform float u_starSize;
uniform float u_revealDuration;
uniform float u_scrollY;
uniform sampler2D u_noise;

out vec4 outColor;

float tnoise(vec2 p) {
  return texture(u_noise, fract(p * 0.00390625)).r;
}

float fbm3(vec2 p) {
  return tnoise(p) * 0.5 + tnoise(p * 2.0 + 31.7) * 0.25 + tnoise(p * 4.0 + 67.3) * 0.125;
}

float fbm4(vec2 p) {
  return fbm3(p) + tnoise(p * 8.0 + 113.1) * 0.0625;
}

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

vec3 starField(vec2 fragCoord, float seed, float time, float density, float starSize, vec3 nebCol, float nebDen) {
  vec3 col = vec3(0.0);
  for (float layer = 0.0; layer < 3.0; layer++) {
    float gridPx = (38.0 + layer * 25.0) / density;
    vec2 grid = fragCoord / gridPx;
    vec2 id = floor(grid);
    vec2 gv = fract(grid) - 0.5;

    float h = hash21(id + seed + layer * 100.0);
    float vis = step(0.45, h);

    vec2 offset = vec2(hash21(id + 1.0), hash21(id + 2.0)) - 0.5;
    vec2 dv = gv - offset * 0.8;
    float d2 = dot(dv, dv);
    float radius = (0.065 - layer * 0.02) * starSize;
    float r2 = radius * radius;
    float brightness = (0.9 - layer * 0.25);
    float twinkle = 0.7 + 0.3 * sin(time * (2.0 + h * 3.0) + h * 100.0);
    float star = smoothstep(r2, r2 * 0.3, d2) * brightness * twinkle * vis;

    float colorVar = hash21(id + 3.0);
    vec3 starCol = colorVar < 0.3 ? vec3(0.7, 0.85, 1.0) :
                   colorVar < 0.6 ? vec3(1.0, 0.95, 0.85) : vec3(0.9, 0.85, 1.0);

    float haloR2 = r2 * 10.0;
    float halo = smoothstep(haloR2, 0.0, d2) * 0.12 * star;
    vec3 haloCol = mix(starCol, nebCol + 0.3, nebDen * 0.6);

    col += starCol * star + haloCol * halo;
  }
  return col;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord / iResolution.xy;
  
  float viewH = iResolution.y;
  float scale = max(iResolution.x, iResolution.y);

  vec2 nebulaCoord = vec2(fragCoord.x, fragCoord.y - u_scrollY);
  vec2 p = (nebulaCoord - 0.5 * iResolution.xy) / scale;
  
  vec2 screenP = (fragCoord - 0.5 * iResolution.xy) / scale;

  float domY = (viewH - fragCoord.y) + u_scrollY;
  float spatialFade = 1.0 - smoothstep(viewH * 0.7, viewH * 1.5, domY);

  float time = iTime * u_speed * 0.15;
  float seed = u_seed;

  float revealT = clamp(iTime / max(u_revealDuration, 0.1), 0.0, 1.0);
  float reveal = revealT * revealT * (3.0 - 2.0 * revealT);

  vec2 q = vec2(fbm4(p + time * 0.3), fbm4(p + 5.0));
  vec2 r = vec2(fbm3(p + 4.0 * q + time * 0.5), fbm3(p + 4.0 * q + 8.0));

  vec2 pr = p + 5.0 * r * u_frequency;
  float f1 = smoothstep(0.2, 0.8, fbm4(pr));
  float f2 = smoothstep(0.3, 0.85, fbm3(p * 1.5 + 3.0 * r * u_frequency));
  float f3 = smoothstep(0.4, 0.9, fbm3(p * 2.5 + 2.0 * r * u_frequency));

  float nebulaDensity = f1 * f1 * 0.8 + f2 * f2 * 0.5 + f3 * f3 * f3 * 0.3;
  nebulaDensity = clamp(nebulaDensity * u_amplitude * 1.5, 0.0, 1.0);

  float dustLane = fbm3(p * 4.0 + r * 2.0 + seed);
  float dustMask = smoothstep(0.35, 0.5, dustLane) * smoothstep(0.65, 0.5, dustLane);
  nebulaDensity *= 1.0 - dustMask * 0.4;

  float filament = abs(fbm3(p * 6.0 + r * 3.0) - 0.5);
  filament = smoothstep(0.05, 0.0, filament) * 0.3;
  nebulaDensity = clamp(nebulaDensity + filament * nebulaDensity, 0.0, 1.0);

  nebulaDensity *= spatialFade;

  float screenPLen2 = dot(screenP, screenP);
  float revealMask = smoothstep(reveal * 2.0 + 0.3 + q.x * 0.3, reveal * 2.0 - 0.2, sqrt(screenPLen2));
  nebulaDensity *= revealMask;

  float zone1 = fbm3(p * 0.7 + seed * 0.5 + time * 0.05);
  float zone2 = fbm3(p * 0.9 + seed * 0.8 + 15.0);

  float purpleZone = smoothstep(0.35, 0.65, zone2);
  float pinkZone = smoothstep(0.4, 0.7, 1.0 - zone1) * smoothstep(0.3, 0.7, zone2);
  float blueZone = smoothstep(0.3, 0.7, zone1);

  vec3 c_space = vec3(0.016, 0.01, 0.035);
  float edgeFactor = smoothstep(0.3, 0.0, nebulaDensity);

  vec3 purple = mix(vec3(0.15, 0.08, 0.22), vec3(0.42, 0.25, 0.55), f1);
  purple = mix(purple, vec3(0.58, 0.42, 0.72), f2 * 0.7);
  purple = mix(purple, vec3(0.25, 0.12, 0.45), edgeFactor * 0.4);

  vec3 pink = mix(vec3(0.45, 0.18, 0.35), vec3(0.78, 0.42, 0.65), f1);
  pink = mix(pink, vec3(0.92, 0.58, 0.78), f2 * 0.7);
  pink = mix(pink, vec3(0.65, 0.25, 0.55), edgeFactor * 0.3);

  vec3 blue = mix(vec3(0.08, 0.12, 0.28), vec3(0.28, 0.52, 0.78), f1);
  blue = mix(blue, vec3(0.42, 0.68, 0.88), f2 * 0.7);
  blue = mix(blue, vec3(0.15, 0.25, 0.55), edgeFactor * 0.35);

  vec3 nebula = c_space;
  nebula = mix(nebula, purple, purpleZone * nebulaDensity * 1.2);
  nebula = mix(nebula, pink, pinkZone * nebulaDensity * 1.1);
  nebula = mix(nebula, blue, blueZone * nebulaDensity);

  float d2core = nebulaDensity * nebulaDensity;
  float coreBrightness = d2core * nebulaDensity * 0.5 * 0.25;
  nebula += vec3(1.0, 0.92, 0.85) * coreBrightness * (purpleZone + pinkZone * 0.8);

  nebula = mix(c_space, nebula, 0.7 + nebulaDensity * 0.8);

  float glowReveal = smoothstep(0.0, 0.6, reveal);
  vec2 g1 = screenP - vec2(0.25, 0.1);
  vec2 g2 = screenP - vec2(-0.3, 0.05);
  vec2 g3 = screenP - vec2(0.0, 0.15);
  float glow1 = 1.0 / (1.0 + dot(g1, g1) * 6.25) * glowReveal * spatialFade;
  float glow2 = 1.0 / (1.0 + dot(g2, g2) * 9.0) * glowReveal * spatialFade;
  float glow3 = 1.0 / (1.0 + dot(g3, g3) * 3.24) * glowReveal * spatialFade;
  
  nebula += vec3(0.98, 0.82, 0.92) * glow1 * 0.08 * (pinkZone + purpleZone);
  nebula += vec3(0.75, 0.88, 0.98) * glow2 * 0.06 * (blueZone + purpleZone * 0.5);
  nebula += vec3(0.9, 0.8, 0.95) * glow3 * 0.04 * nebulaDensity;

  float scatter = d2core * 0.6 * 0.12;
  vec3 scatterColor = mix(vec3(0.6, 0.5, 0.8), vec3(0.9, 0.7, 0.85), pinkZone);
  nebula += scatterColor * scatter * glowReveal * spatialFade;

  vec2 worldUV = fragCoord / iResolution.xy - vec2(0.0, u_scrollY / viewH);
  float spaceDust = fbm3(worldUV * 3.0 + seed * 0.1) * 0.008;
  vec3 spaceBg = c_space + vec3(spaceDust * 0.15, spaceDust * 0.08, spaceDust * 0.25);

  nebula = mix(spaceBg, nebula, spatialFade);

  vec2 starCoord = fragCoord - vec2(0.0, u_scrollY * 0.5);
  vec3 stars = starField(starCoord, seed, iTime, u_density, u_starSize, nebula, nebulaDensity);
  stars *= (1.0 - nebulaDensity * 0.5);

  vec3 col = nebula + stars;
  vec2 vc = uv - 0.5;
  float vignette = 1.0 - smoothstep(0.36, 1.69, dot(vc, vc));
  col *= 0.92 + vignette * 0.08;

  outColor = vec4(col, 1.0);
}
`;

export const UNIVERSE_SHADER_LOW = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float u_speed;
uniform float u_density;
uniform float u_seed;
uniform float u_starSize;
uniform float u_revealDuration;
uniform float u_scrollY;
uniform sampler2D u_noise;

out vec4 outColor;

float hash21(vec2 p) {
    p = fract(p * vec2(123.344, 456.212));
    p += dot(p, p + 45.321);
    return fract(p.x * p.y);
}

float tnoise(vec2 p) {
    return texture(u_noise, fract(p * 0.00390625)).r;
}

float fbm_safe(vec2 p) {
    float n = tnoise(p) * 0.5;
    n += tnoise(p * 2.1 + 15.4) * 0.25;
    n += tnoise(p * 4.2 + 37.1) * 0.125;
    return n;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
    float t = mod(iTime, 3600.0) * u_speed * 0.12;
    float s = u_seed * 0.1;
    
    float viewH = iResolution.y;
    float scale = max(iResolution.x, iResolution.y);
    
    vec2 nebulaCoord = vec2(fragCoord.x, fragCoord.y - u_scrollY);
    vec2 p = (nebulaCoord - 0.5 * iResolution.xy) / scale;
    
    vec2 screenP = (fragCoord - 0.5 * iResolution.xy) / scale;
    
    float domY = (viewH - fragCoord.y) + u_scrollY;
    float spatialFade = 1.0 - smoothstep(viewH * 0.6, viewH * 1.4, domY);

    vec2 q = vec2(fbm_safe(p + t * 0.2 + s), fbm_safe(p + s + 5.2));
    vec2 r = vec2(fbm_safe(p + 3.0 * q + t * 0.4 + s * 1.5), fbm_safe(p + 3.0 * q + 8.1 + s));
    
    float f1 = smoothstep(0.15, 0.85, fbm_safe(p + 4.0 * r + s));
    float f2 = smoothstep(0.25, 0.9, fbm_safe(p * 1.4 + 2.0 * r + s * 2.0));
    
    float revealT = clamp(iTime / max(u_revealDuration, 0.1), 0.0, 1.0);
    float reveal = revealT * revealT * (3.0 - 2.0 * revealT);
    float revealMask = smoothstep(reveal * 2.2 + 0.2, reveal * 2.2 - 0.2, length(screenP));
    
    float nebulaDensity = clamp((f1 * 0.75 + f2 * 0.45) * 1.4, 0.0, 1.0) * spatialFade * revealMask;

    float zone1 = fbm_safe(p * 0.8 + u_seed * 0.5 + t * 0.05);
    float zone2 = fbm_safe(p * 0.9 + u_seed * 0.8 + 12.0);
    float purpleZone = smoothstep(0.35, 0.65, zone2);
    float pinkZone = smoothstep(0.4, 0.7, 1.0 - zone1) * smoothstep(0.3, 0.7, zone2);
    float blueZone = smoothstep(0.3, 0.7, zone1);

    vec3 c_space = vec3(0.016, 0.01, 0.035);
    vec3 purple = mix(vec3(0.15, 0.08, 0.22), vec3(0.42, 0.25, 0.55), f1);
    vec3 pink = mix(vec3(0.45, 0.18, 0.35), vec3(0.78, 0.42, 0.65), f1);
    vec3 blue = mix(vec3(0.08, 0.12, 0.28), vec3(0.28, 0.52, 0.78), f1);

    vec3 nebulaCol = c_space;
    nebulaCol = mix(nebulaCol, purple, purpleZone * nebulaDensity * 1.1);
    nebulaCol = mix(nebulaCol, pink, pinkZone * nebulaDensity * 1.0);
    nebulaCol = mix(nebulaCol, blue, blueZone * nebulaDensity * 0.9);
    nebulaCol += vec3(1.0, 0.92, 0.85) * pow(nebulaDensity, 3.5) * 0.12;

    vec2 starCoord = fragCoord - vec2(0.0, u_scrollY * 0.48);
    float gridScale = 38.0 / u_density; 
    vec2 gv = starCoord / gridScale;
    vec2 id = floor(gv);
    vec2 fr = fract(gv) - 0.5;

    vec3 starLayer = vec3(0.0);
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y));
            float h = hash21(id + offset + u_seed);
            
            vec2 pos = offset + (vec2(hash21(id + offset + 4.33), hash21(id + offset + 7.12)) - 0.5) * 1.8;
            float d = length(fr - pos);
            
            bool isLarge = h > 0.965;
            float sz = (isLarge ? (1.3 + h) : (0.45 + h * 0.65)) * u_starSize * 0.07;
            float opacity = (isLarge ? 0.8 : (0.2 + h * 0.4)) * (1.0 - nebulaDensity * 0.6);
            float twinkle = 0.85 + 0.15 * sin(t * 15.0 + h * 60.0);
            
            vec3 sCol = isLarge ? mix(vec3(0.78, 0.9, 1.0), vec3(1.0, 0.85, 0.92), h) : vec3(0.95, 0.97, 1.0);
            
            float star = smoothstep(sz, sz * 0.3, d) * opacity * twinkle;
            
            if(isLarge) {
                star += smoothstep(sz * 4.0, 0.0, d) * 0.1 * twinkle;
            }
            
            starLayer += sCol * star;
        }
    }

    outColor = vec4(nebulaCol + starLayer, 1.0);
}
`;