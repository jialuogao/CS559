var grobjects = grobjects || [];

var Building = undefined;

(function(){
  "use strict";
  var shaderProgram = undefined;
  var buffers = undefined;

  Building = function Building(position, size, color){
    this.name = "CCTV Headquarters";
    this.position = position || [1.5,1.5,2.0];
    this.size = size || 1.0;
    this.color = color || [0.4,0.9,1.0];
  }
  Building.prototype.init = function(drawingState){
    var gl = drawingState.gl;
    if(!shaderProgram){
      shaderProgram = twgl.createProgramInfo(gl, ["building-vs", "building-fs"]);
    }
    if(!buffers){
      var pos = [
        //bot out
        3.0,0.0,0.0,      3.0,0.0,1.0,      0.0,0.0,0.0,
        0.0,0.0,0.0,      0.0,0.0,1.0,      3.0,0.0,1.0,
        0.0,0.0,1.0,      1.0,0.0,1.0,      1.0,0.0,3.0,
        0.0,0.0,1.0,      0.0,0.0,3.0,      1.0,0.0,3.0,
        //back out
        2.7,3.3,0.3,      3.0,0.0,0.0,      2.0,3.437,0.3,
        2.3,0.0,0.0,      3.0,0.0,0.0,      2.0,3.437,0.3,
        2.3,0.0,0.0,      2.3,0.8,0.071,    0.08,0.8,0.071,
        2.3,0.0,0.0,      0.0,0.0,0.0,      0.08,0.8,0.071,
        // left out
        0.0,0.0,3.0,      0.08,0.8,0.071,   0.0,0.0,0.0,
        0.0,0.0,3.0,      0.0,0.0,2.3,      0.4,4.063,1.9,
        0.0,0.0,3.0,      0.4,4.2,2.6,      0.4,4.063,1.9,
        0.08,0.8,0.071,   0.0,0.0,3.0,      0.081,0.8,2.9,
        //top in
        2.235,0.8,1.071,  2.235,0.8,0.071,  0.08,0.8,0.071,
        0.08,0.8,0.071,   0.08,0.8,1.071,   2.235,0.8,1.071,
        0.08,0.8,1.071,   0.08,0.8,2.221,   1.1,0.8,2.221,
        0.08,0.8,1.071,   1.08,0.8,1.071,   1.1,0.8,2.221,
        //left in
        2.235,0.8,0.067,  2.235,0.8,1.071,  2.0,3.437,0.3,
        2.235,0.8,1.071,  2.1,2.4,1.171,    2.0,3.437,0.3,
        2.1,2.4,2.1,      2.1,2.4,1.171,    2.0,3.437,0.3,
        2.1,2.4,2.1,      1.9,3.75,2.0,     2.0,3.437,0.3,
        //back in
        1.1,0.8,2.221,    0.08,0.8,2.221,   0.4,4.063,1.9,
        1.2,2.4,2.071,    1.1,0.8,2.221,    0.4,4.063,1.9,
        2.1,2.4,2.1,      1.2,2.4,2.071,    0.4,4.063,1.9,
        2.1,2.4,2.1,      0.4,4.063,1.9,    1.9,3.75,2.0,
        //right in
        1.0,0.0,3.0,      1.0,0.0,1.0,      1.08,0.8,1.071,
        1.0,0.0,3.0,      1.1,0.8,2.221,    1.08,0.8,1.071,
        1.2,2.4,2.071,    1.0,0.0,3.0,      1.1,0.8,2.221,
        1.2,2.4,2.071,    1.0,0.0,3.0,      1.2,2.4,2.78,
        //front in
        1.08,0.8,1.071,   1.0,0.0,1.0,      3.0,0.0,1.0,
        3.0,0.0,1.0,      1.08,0.8,1.071,   2.235,0.8,1.071,
        2.78,2.4,1.2,     3.0,0.0,1.0,      2.1,2.4,1.171,
        2.1,2.4,1.171,    3.0,0.0,1.0,      2.235,0.8,1.071,
        //front out
        0.0,0.0,3.0,      1.0,0.0,3.0,      0.4,4.2,2.6,
        1.0,0.0,3.0,      1.2,2.4,2.78,     0.4,4.2,2.6,
        0.4,4.2,2.6,      1.2,2.4,2.78,     2.752,2.4,2.752,
        0.4,4.2,2.6,      2.6,3.75,2.65,    2.752,2.4,2.752,
        //right out
        2.7,3.3,0.3,      3.0,0.0,1.0,      3.0,0.0,0.0,
        3.0,0.0,1.0,      2.78,2.4,1.2,     2.7,3.3,0.3,
        2.7,3.3,0.3,      2.78,2.4,1.2,     2.752,2.4,2.752,
        2.7,3.3,0.3,      2.6,3.75,2.65,    2.752,2.4,2.752,
        //top out
        0.4,4.063,1.9,    0.4,4.2,2.6,      2.6,3.75,2.65,
        0.4,4.063,1.9,    1.9,3.75,2.0,     2.6,3.75,2.65,
        2.0,3.437,0.3,    2.7,3.3,0.3,      2.6,3.75,2.65,
        2.0,3.437,0.3,    1.9,3.75,2.0,     2.6,3.75,2.65,
        //bot in
        2.1,2.4,2.1,      2.1,2.4,1.171,    2.78,2.4,1.2,
        2.752,2.4,2.752,  2.1,2.4,2.1,      2.78,2.4,1.2,
        2.752,2.4,2.752,  2.1,2.4,2.1,      1.2,2.4,2.78,
        1.2,2.4,2.78,     1.2,2.4,2.071,    2.1,2.4,2.1
      ];
      var norms = [];
      for(var i = 0; i<pos.length; i+=36){
        var v1 = new Float32Array([pos[i]-pos[i+3],pos[i+1]-pos[i+4],pos[i+2]-pos[i+5]]);
        var v2 = new Float32Array([pos[i]-pos[i+6],pos[i+1]-pos[i+7],pos[i+2]-pos[i+8]]);
        var n = twgl.v3.normalize(twgl.v3.cross(v1,v2));
        for(var j = 0; j<12 ; j++){
          norms.push(n[0]);
          norms.push(n[1]);
          norms.push(n[2]);
        }
      }
      var arrays = {
        vPosition : { numComponents: 3, data: pos },
        vNormal : { numComponents: 3, data: norms }
      };
      buffers = twgl.createBufferInfoFromArrays(gl,arrays);
    }
  };

  Building.prototype.draw = function(drawingState) {
    var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
    twgl.m4.setTranslation(modelM,this.position,modelM);
    var gl = drawingState.gl;
    gl.useProgram(shaderProgram.program);
    twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
    twgl.setUniforms(shaderProgram,{
        view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
        lightColor:drawingState.sunColor, model: modelM, objColor: this.color});
    twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
  };
  Building.prototype.center = function(drawingState){
    return this.position;
  }
})();

grobjects.push(new Building([-1.5,0.02,-1.5],1.0));
