var rangeFar = 70;
Shadow = function Shadow(){
  this.name="shadow";
  this.shadowRangeNearFar = [0.05,rangeFar*3.0];
  this.shadowMapGenProgram = undefined;
  this.shadowMapFramebuffer = undefined;
  this.shadowMapRenderbuffer = undefined;
  this.shadowMap = undefined;
  this.lightPosition = undefined;
  this.textureSize = undefined;
  this.shadowReady = false;
}
Shadow.prototype.initShadow = function(drawingState,textureSize){
  var gl = drawingState.gl;
  this.textureSize = 512||textureSize;
  this.lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,rangeFar*3.0);

  this.shadowMap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.shadowMap);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.textureSize, this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  this.shadowMapFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMapFramebuffer);
  this.shadowMapRenderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.shadowMapRenderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.textureSize, this.textureSize);

  gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

Shadow.prototype.shadow = function(drawingState,objects){
  this.lightPosition = twgl.v3.mulScalar(drawingState.sunDirection,rangeFar);

  var gl = drawingState.gl;
  if(!this.shadowMapGenProgram){
    this.shadowMapGenProgram = twgl.createProgramInfo(gl, ["shadowMapGen-vs", "shadowMapGen-fs"]);
  }
  gl.useProgram(this.shadowMapGenProgram.program);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowMapFramebuffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.shadowMapRenderbuffer);
  gl.viewport(0,0, this.textureSize, this.textureSize);

  var eye = this.lightPosition;
  var target = [0,0,0];

  var up = drawingState.sunDirSlope;
  var view = m4.inverse(m4.lookAt(eye,target,up));
  //var Tprojection=m4.perspective(Math.PI/2,1,this.shadowRangeNearFar[0],this.shadowRangeNearFar[1]);
  var Tprojection=m4.ortho(-50, 50, -50, 50, this.shadowRangeNearFar[0], this.shadowRangeNearFar[1]);
  twgl.setUniforms(this.shadowMapGenProgram,{
    lightPosition: this.lightPosition,
    shadowRangeNearFar: this.shadowRangeNearFar,
    proj:Tprojection,
    view:view
  });
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.shadowMap,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.shadowMapRenderbuffer);
  gl.clearColor(1,1,1,1);
  gl.disable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // draw
  gl.bindTexture(gl.TEXTURE_2D,this.shadowMap);
  var programInfo = this.shadowMapGenProgram;
  objects.forEach(function(obj){
    if(obj.buffers)
    if(obj.name!="skybox" && obj.name!="test" && obj.name!="Ground Plane" && obj.name!="copter0"){
      if(obj.draw){
        twgl.setUniforms(programInfo,{model: obj.model});
        var gl = drawingState.gl;
        gl.useProgram(programInfo.program);
        for(var i =0; i<obj.buffers.length;i++){
          twgl.setBuffersAndAttributes(gl,programInfo,obj.buffers[i]);
          twgl.drawBufferInfo(gl, gl.TRIANGLES, obj.buffers[i]);
        }
      }
    }
    else if(obj.name=="copter0"){
      var gl = drawingState.gl;
      gl.useProgram(programInfo.program);
      obj.update(drawingState);
      for(var i =0; i<obj.buffers.length;i++){
        twgl.setUniforms(programInfo,{model: obj.models[i]});
        twgl.setBuffersAndAttributes(gl,programInfo,obj.buffers[i]);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, obj.buffers[i]);
      }
    }
  });
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
