void VS( float3 vPosIn     : POSITION,
         float4 vDiffuseIn : COLOR,
         float4 uv_in      : TEXCOORD0,  // .xy = warped UVs, .zw = orig UVs
         float2 rad_ang_in : TEXCOORD1,  // .x = rad, .y = ang
     out float4 vPosProj   : POSITION,
     out float4 _vDiffuse  : COLOR, 
     out float4 _uv        : TEXCOORD0, 
     out float2 _rad_ang   : TEXCOORD1 )
{  
    vPosProj = float4(vPosIn.x, vPosIn.y, vPosIn.z, 1);
    _vDiffuse = vDiffuseIn;
    _uv = uv_in.xyzw;
    _rad_ang = rad_ang_in.xy;
}
