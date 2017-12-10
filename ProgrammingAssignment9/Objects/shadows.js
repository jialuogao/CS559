var shadowRangeNearFar = [0.05,1000];
var shadowMapGenProgram=undefined;
var shadowMapFramebuffer=undefined;
var shadowMapRenderbuffer = undefined;
var shadowMapCube = undefined;
var lightPosition = undefined;
var textureSize = undefined;
var shadowReady = false;
function initShadow(drawingState,textureSize){
  var gl = drawingState.gl;
  textureSize = 512||textureSize;
  lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,1000);
  gl.activeTexture(gl.TEXTURE7);
  shadowMapCube = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
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
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

  shadowMapFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);

  shadowMapRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureSize, textureSize);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function shadow(drawingState,objects){
  var modelM = m4.identity();

  var gl = drawingState.gl;
  if(!shadowMapGenProgram){
    shadowMapGenProgram = twgl.createProgramInfo(gl, ["shadowMapGen-vs", "shadowMapGen-fs"]);
  }
  gl.useProgram(shadowMapGenProgram.program);
  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMapCube);
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER, shadowMapRenderbuffer);
  gl.viewport(0,0, textureSize, textureSize);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  //set attribute and uniforms

  var eye = lightPosition;
  var target = [1,0,0];
  var up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));
  var Tprojection=m4.perspective(Math.PI/2,1,shadowRangeNearFar[0],shadowRangeNearFar[1]);
  twgl.setUniforms(shadowMapGenProgram,{
    lightPosition: lightPosition,
    shadowRangeNearFar: shadowRangeNearFar,
    model:modelM,
    proj:Tprojection,
    view:view
  });
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  target = [-1,0,0];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  target = [0,1,0];
  up = [0,0,1];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  target = [0,-1,0];
  up = [0,0,-1];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  target = [0,0,1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  target = [0,0,-1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(drawingState,objects);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}
function draw(drawingState,objects){
  objects.forEach(function(obj){
    if(obj.buffers)
    if(obj.draw){
      var modelM = m4.scaling([obj.size,obj.size,obj.size]);
      m4.setTranslation(modelM,obj.position,modelM);
      var gl = drawingState.gl;
      gl.useProgram(shadowMapGenProgram.program);
      twgl.setBuffersAndAttributes(gl,shadowMapGenProgram,obj.buffers);
      twgl.setUniforms(shadowMapGenProgram,{
        view:drawingState.view, proj:drawingState.proj,
         model: modelM,
        lightPosition: lightPosition,
        shadowRangeNearFar:shadowRangeNearFar
      });
      twgl.drawBufferInfo(gl, gl.TRIANGLES, obj.buffers);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  });
}
