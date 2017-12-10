var grobjects = grobjects || [];
var Skybox = undefined;



(function(){
  "use strict";
  var shaderProgram = undefined;
  var skyboxBuffers = undefined;
  var texture = undefined;
  var skybox_posx = LoadedImageFiles["skybox_posx.png"];
  var skybox_negx = LoadedImageFiles["skybox_negx.png"];
  var skybox_posz = LoadedImageFiles["skybox_posz.png"];
  var skybox_negz = LoadedImageFiles["skybox_negz.png"];
  var skybox_posy = LoadedImageFiles["skybox_posy.png"];
  var skybox_negy = LoadedImageFiles["skybox_negy.png"];

  Skybox = function Skybox() {
       this.name = "skybox"
       this.position = [0,0,0];
   }
   Skybox.prototype.init = function(drawingState) {
     this.position = drawingState.drivePos;
     var gl=drawingState.gl;
     if (!shaderProgram) {
         shaderProgram = twgl.createProgramInfo(gl, ["skybox-vs", "skybox-fs"]);
     }
     if (!skyboxBuffers) {
       var s = 1000;
       var arrays = {
         vPosition : {numComponents: 3, data: [-s,-s,s, s,-s,s, s,s,s, -s,-s,s, s,s,s, -s,s,s,
          -s,-s,-s, -s,s,-s, s,s,-s, -s,-s,-s, s,s,-s, s,-s,-s,
          -s,s,-s, -s,s,s, s,s,s, -s,s,-s, s,s,s, s,s,-s,
          -s,-s,-s, s,-s,-s, s,-s,s, -s,-s,-s, s,-s,s, -s,-s,s,
          s,-s,-s, s,s,-s, s,s,s, s,-s,-s, s,s,s, s,-s,s,
          -s,-s,-s, -s,-s,s, -s,s,s, -s,-s,-s, -s,s,s, -s,s,-s
        ]}
        // ,vNoramal: {numComponents: 3, data:[0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
        //   0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        //   0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
        //   0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        //   1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
        //   -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0
        // ]}
       };
       skyboxBuffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

       texture = gl.createTexture();
       gl.activeTexture(gl.TEXTURE0);
       gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

       // X
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_posx);

       // -X
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_negx);

       // Z
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_posz);

       // -Z
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_negz);

       // Y
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_posy);

       // -Y
       gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skybox_negy);
       gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

       gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
       //gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
     }
   };
   Skybox.prototype.draw = function(drawingState) {
       // make the helicopter fly around
       // this will change position and orientation

       var modelM = twgl.m4.rotationY(drawingState.realtime/30000);
       twgl.m4.setTranslation(modelM,twgl.m4.transformPoint(drawingState.camera, [0, 0, 0]),modelM);
       // the drawing coce is straightforward - since twgl deals with the GL stuff for us
       var gl = drawingState.gl;
       gl.useProgram(shaderProgram.program);
       twgl.setUniforms(shaderProgram,{
         view:drawingState.view, proj:drawingState.proj, model: modelM,
         //lightdir:drawingState.sunDirection,
         //lightColor:drawingState.sunColor
       });
       twgl.setBuffersAndAttributes(gl,shaderProgram,skyboxBuffers); 
       shaderProgram.program.skybox = gl.getUniformLocation(shaderProgram.program, "skybox");
       gl.activeTexture(gl.TEXTURE0);
       gl.uniform1i(shaderProgram.program.skybox, 0);
       gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
       twgl.drawBufferInfo(gl, gl.TRIANGLES, skyboxBuffers);
   };
   Skybox.prototype.center = function(drawingState) {
       return this.position;
   }
})();

grobjects.push(new Skybox());
