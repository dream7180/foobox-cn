void VS( float3 vPosIn     : POSITION,
         float4 vDiffuseIn : COLOR,
         float4 uv1        : TEXCOORD0,  // .xy = warped UVs, .zw = orig UVs
         float2 uv2        : TEXCOORD1,  // .x = rad, .y = ang
     out float4 vPosProj   : POSITION,
     out float2 uv         : TEXCOORD0 )
{  
    vPosProj = float4(vPosIn.xy,1,1);
    uv = uv1.xy;
}
