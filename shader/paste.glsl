uniform float time;
uniform float progress;
uniform sampler2D texture1;
//uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
float PI = 3.141592653589793238;
//varying vec4 vPosition;

float sdSphere( vec3 p, float r )
{
  return length(p)-r;
}

float sdf(vec3 p){
	return sdSphere(p, 0.4);
}

vec3 calcNormal( in vec3 p ) // for function f(p)
{
    const float eps = 0.0001; // or some other value
    const vec2 h = vec2(eps,0);
    return normalize( vec3(sdf(p+h.xyy) - sdf(p-h.xyy),
                           sdf(p+h.yxy) - sdf(p-h.yxy),
                           sdf(p+h.yyx) - sdf(p-h.yyx) ) );
}

void main()	{
	vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec3 camPos = vec3(0., 0., 2.);
	vec3 ray = normalize(vec3((vUv-vec2(0.5))*resolution.zw, -1));

	vec3 rayPos = camPos;
	float t = 0.;
	float tMax = 5.;

	for(int i=0; i<256; ++i){
		vec3 pos = camPos + t*ray;
		float h = sdf(pos);
		if(h<0.0001 || t>tMax) break;
		t+=h;
	}

	vec3 color = vec3(0.);
	if (t<tMax){
		vec3 pos = camPos + t*ray;
		color = vec3(1.);
		vec3 normal = calcNormal();
		color = normal;
		flaot diff = dot(vec3(1.),normal);
		color = vec3(diff);
	}


	gl_FragColor = vec4(color,1.);
}