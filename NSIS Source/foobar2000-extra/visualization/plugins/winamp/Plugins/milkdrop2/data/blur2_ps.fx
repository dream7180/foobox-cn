//texture   PrevFrameImage;
//sampler2D sampler_main = sampler_state { Texture = <PrevFrameImage>; };
//float4 _c0; // source texsize (.xy), and inverse (.zw)




//float4 _c5; // w1,w2,d1,d2
//float4 _c6; // w_div, edge_darken_c1, edge_darken_c2, edge_darken_c3

void PS( float2 uv       : TEXCOORD,
     out float4 ret      : COLOR0      )
{
    //SHORT VERTICAL PASS 2:
    //const float w1 = w[0]+w[1] + w[2]+w[3];
    //const float w2 = w[4]+w[5] + w[6]+w[7];
    //const float d1 = 0 + 2*((w[2]+w[3])/w1);
    //const float d2 = 2 + 2*((w[6]+w[7])/w2);
    //const float w_div = 1.0/((w1+w2)*2);





    #define srctexsize _c0
    #define w1 _c5.x
    #define w2 _c5.y


    #define d1 _c5.z
    #define d2 _c5.w
    

    #define edge_darken_c1 _c6.y
    #define edge_darken_c2 _c6.z
    #define edge_darken_c3 _c6.w

    #define w_div   _c6.x

    // note: if you just take one sample at exactly uv.xy, you get an avg of 4 pixels.
    //float2 uv2 = uv.xy;// + srctexsize.zw*float2(-0.5,-0.5);
    float2 uv2 = uv.xy + srctexsize.zw*float2(1,0);     // + moves blur UP, LEFT by TWO-pixel increments! (since texture is 1/2 the size of blur1_ps)

    float3 blur = 
            ( tex2D( sampler_main, uv2 + float2(0, d1*srctexsize.w) ).xyz
            + tex2D( sampler_main, uv2 + float2(0,-d1*srctexsize.w) ).xyz)*w1 +
            ( tex2D( sampler_main, uv2 + float2(0, d2*srctexsize.w) ).xyz
            + tex2D( sampler_main, uv2 + float2(0,-d2*srctexsize.w) ).xyz)*w2
            ;
    blur.xyz *= w_div;

    // tone it down at the edges:  (only happens on 1st X pass!)
    float t = min( min(uv.x, uv.y), 1-max(uv.x,uv.y) );
    t = sqrt(t);
    t = edge_darken_c1 + edge_darken_c2*saturate(t*edge_darken_c3);
    blur.xyz *= t;
    
    ret.xyz = blur;
    ret.w   = 1;
    //ret.xyzw = tex2D(sampler_main, uv + 0*srctexsize.zw);    
}
