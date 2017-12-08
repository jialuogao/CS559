var shadowRangeNearFar = [0.05,1000];
var m4 = twgl.m4;
var shadowMapGenProgram=undefined;
var setUpShadowMap=function(drawingState, texSize){
  var gl = drawingState.gl;
  var textureSize = 512||texSize;

  var shadowMapCube = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var shadowMapFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);

  var depthRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureSize, textureSize);
  generateShadowMap(drawingState,shadowMapCube,shadowMapFramebuffer,depthRenderbuffer,textureSize);
}

function generateShadowMap(drawingState,shadowMapCube,shadowMapFramebuffer,depthRenderbuffer,textureSize){
  var gl = drawingState.gl;
  if(!shadowMapGenProgram){
    shadowMapGenProgram = twgl.createProgramInfo(gl, ["shadowMapGen-vs", "shadowMapGen-fs"]);
  }
  var shadowMGPprogram = shadowMapGenProgram.program;
  gl.useProgram(shadowMapGenProgram.program);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);
  // gl.clearColor(0,0,0,1);
  // gl.disable(gl.DEPTH_TEST);
  // gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
  gl.viewport(0,0, textureSize, textureSize);
  gl.enable(gl.DEPTH_TEST);

  var lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,1000);
  //set attribute and uniforms
  twgl.setUniforms(shadowMapGenProgram,{
      lightPosition: lightPosition,
      shadowRangeNearFar: shadowRangeNearFar});
  gl.uniform2fv(shadowMGPprogram.uniforms.shadowRangeNearFar, shadowRangeNearFar);

  var eye = lightPosition;
  var target = [1,0,0];
  var up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));
  var Tprojection=m4.perspective(Math.PI/2,1,shadowRangeNearFar[0],shadowRangeNearFar[1]);
  var Tmvp=m4.multiply(m4.multiply(Tmodel,view),Tprojection);
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

  target = [-1,0,0];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

  target = [0,1,0];
  up = [0,0,1];
  view = m4.inverse(m4.lookAt(eye,target,up));
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

  target = [0,-1,0];
  up = [0,0,-1];
  view = m4.inverse(m4.lookAt(eye,target,up));
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

  target = [0,0,1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

  target = [0,0,-1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));gl.uniformMatrix4fv(shadowMapGenProgram.uniforms.view,gl.FALSE,view);
  gl.uniformMatrix4fv(shadowMGPprogram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  drawAll(drawingState);

}
