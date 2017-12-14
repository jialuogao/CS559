Shadow = function Shadow(){
  this.name="shadow";
  this.shadowRangeNearFar = [0.05,1000];
  this.shadowMapGenProgram = undefined;
  this.shadowMapFramebuffer = undefined;
  this.shadowMapRenderbuffer = undefined;
  this.shadowMapCube = undefined;
  this.lightPosition = undefined;
  this.textureSize = undefined;
  this.shadowReady = false;
}
Shadow.prototype.initShadow = function(drawingState,textureSize){
  var gl = drawingState.gl;
  this.textureSize = 512||textureSize;
  this.lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,1000);
  this.shadowMapCube = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.shadowMapCube);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, this.textureSize,this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

  this.shadowMapFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMapFramebuffer);

  this.shadowMapRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.shadowMapRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.textureSize, this.textureSize);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

Shadow.prototype.shadow = function(drawingState,objects){
  var modelM = m4.identity();
  this.lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,1000);

  var gl = drawingState.gl;
  if(!this.shadowMapGenProgram){
    this.shadowMapGenProgram = twgl.createProgramInfo(gl, ["shadowMapGen-vs", "shadowMapGen-fs"]);
  }
  gl.useProgram(this.shadowMapGenProgram.program);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.shadowMapCube);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMapFramebuffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.shadowMapRenderbuffer);
  gl.viewport(0,0, this.textureSize, this.textureSize);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  //set attribute and uniforms

  var eye = this.lightPosition;
  var target = [1,0,0];
  var up = [0,-1,0];
  var view = m4.inverse(m4.lookAt(eye,target,up));
  var Tprojection=m4.perspective(Math.PI/2,1,this.shadowRangeNearFar[0],this.shadowRangeNearFar[1]);
  twgl.setUniforms(this.shadowMapGenProgram,{
    lightPosition: this.lightPosition,
    shadowRangeNearFar: this.shadowRangeNearFar,
    proj:Tprojection,
    model:modelM,
    view:view
  });
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_X,this.shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.draw(drawingState,objects);

  target = [-1,0,0];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(this.shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,this.shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.draw(drawingState,objects);

  // target = [0,1,0];
  // up = [0,0,1];
  // view = m4.inverse(m4.lookAt(eye,target,up));
  // twgl.setUniforms(this.shadowMapGenProgram,{view:view});
  // gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,this.shadowMapCube,0);
  // gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  // gl.clearColor(0,0,0,1);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // this.draw(drawingState,objects);

  target = [0,-1,0];
  up = [0,0,-1];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(this.shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,this.shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.draw(drawingState,objects);

  target = [0,0,1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(this.shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,this.shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.draw(drawingState,objects);

  target = [0,0,-1];
  up = [0,-1,0];
  view = m4.inverse(m4.lookAt(eye,target,up));
  twgl.setUniforms(this.shadowMapGenProgram,{view:view});
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,this.shadowMapCube,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.draw(drawingState,objects);

  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}
Shadow.prototype.draw = function(drawingState,objects){
  objects.forEach(function(obj){
    if(obj.buffers)
    if(obj.draw){
      var modelM = m4.scaling([obj.size,obj.size,obj.size]);
      m4.setTranslation(modelM,obj.position,modelM);
      var gl = drawingState.gl;
      gl.useProgram(this.shadowMapGenProgram.program);
      twgl.setBuffersAndAttributes(gl,this.shadowMapGenProgram,obj.buffers);
      twgl.drawBufferInfo(gl, gl.TRIANGLES, obj.buffers);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  });
}
