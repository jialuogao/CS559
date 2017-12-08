var shadowRangeNearFar = [0.05,1000];
function setUpShadowMap(gl, texSize){
  var textureSize = 512||texSize;
  var shadowMapCube = gl.createTexture();
  gl.bindTexture{gl.TEXTURE_CUBE_MAP, shadowMapCube};
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, textureSize,textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var shadowMapFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.shadowMapFramebuffer);

  var depthRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureSize, textureSize);
}

function generateShadowMap(gl,shadowMapGenProgram){
  gl.useProgram(shadowMapGenProgram);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderbuffer);
  var viewport(0,0, textureSize, textureSize);
  gl.enable(gl.DEPTH_TEST);

  //set attribute and uniforms

  gl.uniform2fv(shadowMapGenProgram.uniforms.shadowRangeNearFar, shadowRangeNearFar)

  var eye = lightPosition;
  var target = [1,0,0];
  var up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));
  gl.uniformMatrix4fv(shadowMapGenProgram.uniforms.view,gl.FALSE,view);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

  target = [-1,0,0];
  up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));

  target = [0,1,0];
  up = [0,0,1];
  var view = m4.inverse(m4.lookAt(eye,target,up));

  target = [0,-1,0];
  up = [0,0,-1];
  var view = m4.inverse(m4.lookAt(eye,target,up));

  target = [0,0,1];
  up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));

  target = [0,0,-1];
  up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));
  var Tprojection=m4.perspective(Math.PI/2,1,shadowRangeNearFar[0],shadowRangeNearFar[1]);
  var Tmvp=m4.multiply(m4.multiply(Tmodel,view),Tprojection);

}
