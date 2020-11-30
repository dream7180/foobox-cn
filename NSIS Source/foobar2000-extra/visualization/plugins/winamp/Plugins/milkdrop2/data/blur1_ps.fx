//texture   PrevFrameImage;
//sampler2D sampler_main = sampler_state { Texture = <PrevFrameImage>; };
//float4 _c0; // source texsize (.xy), and inverse (.zw)
//float4 _c1; // w1..w4
//float4 _c2; // d1..d4
//float4 _c3; // scale, bias, w_div




void PS( float2 uv       : TEXCOORD,
     out float4 ret      : COLOR0      )
{
    // LONG HORIZ. PASS 1:
    //const float w[8] = { 4.0, 3.8, 3.5, 2.9, 1.9, 1.2, 0.7, 0.3 };  <- user can specify these
    //const float w1 = w[0] + w[1];
    //const float w2 = w[2] + w[3];
    //const float w3 = w[4] + w[5];
    //const float w4 = w[6] + w[7];
    //const float d1 = 0 + 2*w[1]/w1;
    //const float d2 = 2 + 2*w[3]/w2;
    //const float d3 = 4 + 2*w[5]/w3;
    //const float d4 = 6 + 2*w[7]/w4;
    //const float w_div = 0.5/(w1+w2+w3+w4);
    #define srctexsize _c0
    #define w1 _c1.x
    #define w2 _c1.y
    #define w3 _c1.z
    #define w4 _c1.w
    #define d1 _c2.x
    #define d2 _c2.y
    #define d3 _c2.z
    #define d4 _c2.w
    #define fscale _c3.x
    #define fbias  _c3.y
    #define w_div  _c3.z

    // note: if you just take one sample at exactly uv.xy, you get an avg of 4 pixels.
    //float2 uv2 = uv.xy;// + srctexsize.zw*float2(0.5,0.5);
    float2 uv2 = uv.xy + srctexsize.zw*float2(1,1);     // + moves blur UP, LEFT by 1-pixel increments
    
    float3 blur = 
            ( tex2D( sampler_main, uv2 + float2( d1*srctexsize.z,0) ).xyz
            + tex2D( sampler_main, uv2 + float2(-d1*srctexsize.z,0) ).xyz)*w1 +
            ( tex2D( sampler_main, uv2 + float2( d2*srctexsize.z,0) ).xyz
            + tex2D( sampler_main, uv2 + float2(-d2*srctexsize.z,0) ).xyz)*w2 +
            ( tex2D( sampler_main, uv2 + float2( d3*srctexsize.z,0) ).xyz
            + tex2D( sampler_main, uv2 + float2(-d3*srctexsize.z,0) ).xyz)*w3 +
            ( tex2D( sampler_main, uv2 + float2( d4*srctexsize.z,0) ).xyz
            + tex2D( sampler_main, uv2 + float2(-d4*srctexsize.z,0) ).xyz)*w4
            ;
    blur.xyz *= w_div;
    
    blur.xyz = blur.xyz*fscale + fbias;
       
    ret.xyz = blur;
    ret.w   = 1;
    //ret.xyzw = tex2D(sampler_main, uv + 0*srctexsize.zw);    
}
