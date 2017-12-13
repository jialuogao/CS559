var grobjects = grobjects || [];

var Headquarter = undefined;

(function(){
  "use strict";

  var shaderProgram = undefined;
  Headquarter = function Headquarter(position, size){
    this.name = "CCTV Headquarters";
    this.position = position || [1.5,1.5,2.0];
    this.size = size || 1.0;
    this.color = [0.6,0.9,1.0];
    this.buffers=undefined;
  }
  Headquarter.prototype.init = function(drawingState){
    var gl = drawingState.gl;
    if(!shaderProgram){
      shaderProgram = twgl.createProgramInfo(gl, ["headquarter-vs", "headquarter-fs"]);
    }
    if(!this.buffers){
      var pos = [
        //bot out
        3.0,0.0,0.0,      3.0,0.0,1.0,      0.0,0.0,0.0,
        0.0,0.0,0.0,      0.0,0.0,1.0,      3.0,0.0,1.0,
        0.0,0.0,1.0,      1.0,0.0,1.0,      1.0,0.0,3.0,
        0.0,0.0,1.0,      0.0,0.0,3.0,      1.0,0.0,3.0,
        //bot in
        2.1,2.4,2.1,      2.1,2.4,1.171,    2.78,2.4,1.2,
        2.752,2.4,2.752,  2.1,2.4,2.1,      2.78,2.4,1.2,
        2.752,2.4,2.752,  2.1,2.4,2.1,      1.2,2.4,2.78,
        1.2,2.4,2.78,     1.2,2.4,2.071,    2.1,2.4,2.1,
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
        0.08,0.8,0.071,   1.08,0.8,1.071,   2.235,0.8,1.071,
        0.08,0.8,0.071,   0.08,0.8,2.221,   1.1,0.8,2.221,
        0.08,0.8,0.071,   1.08,0.8,1.071,   1.1,0.8,2.221,
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
        2.0,3.437,0.3,    1.9,3.75,2.0,     2.6,3.75,2.65
      ];
      var norms = [];
      for(var i = 0; i<pos.length; i+=36){
        if(i<72){
          for(var j=0; j<36;j++){
            norms.push(0);
          }
        }
        else{
          var v1 = new Float32Array([pos[i]-pos[i+3],pos[i+1]-pos[i+4],pos[i+2]-pos[i+5]]);
          var v2 = new Float32Array([pos[i]-pos[i+6],pos[i+1]-pos[i+7],pos[i+2]-pos[i+8]]);
          var n = twgl.v3.normalize(twgl.v3.cross(v1,v2));
          for(var j = 0; j<12 ; j++){
            norms.push(n[0]);
            norms.push(n[1]);
            norms.push(n[2]);
          }
        }
      }
      var texCoord = [
        //bot out
        0,0,      0,0,      0,0,
        0,0,      0,0,      0,0,
        0,0,      0,0,      0,0,
        0,0,      0,0,      0,0,
        //bot in
        0.7,  .7,       0.7,0.39,    0.9267,0.4,
        0.917,0.917,    0.7,0.7,     0.9267,0.4,
        0.917, 0.917,   0.7, 0.7,    0.9267,0.4,
        0.9267,0.4,     0.69,0.4,    0.7,   0.7,
        //back out
        0.9,1.1,      1,0,           0.67,1.146,
        0.767,0,      1,0,           0.67,1.146,
        0.767,0,      0.767,0.267,   0.0267,0.267,
        0.767,0,      0,0,           0.0267,0.267,
        // left out
        1,0,            0.0237,0.267,   0,0,
        1,0,            0.767,0,        0.633,1.354,
        1,0,            0.867,1.4,      0.633,1.354,
        0.0237,0.267,   1,0,            0.967,0.267,
        //top in
        0.357, 0.745,   0.0237,0.745,   0.0237,0.0267,
        0.0237,0.0267,  0.36,  0.357,   0.357, 0.745,
        0.0267,0.0267,  0.0267,0.74,    0.367, 0.74,
        0.0267,0.0267,  0.36,  0.357,   0.367, 0.74,
        //left in
        0.0223,0.267,     0.357,0.267,      0.1,1.146,
        0.357, 0.267,     0.39, 0.8,        0.1,1.146,
        0.7,   0.8,       0.39, 0.8,        0.1,1.146,
        0.7,   0.8,       0.67, 1.25,       0.1,1.146,
        //back in
        0.367,0.267,    0.0267,0.267,   0.133,1.354,
        0.4,0.8,        0.367,0.267,    0.133,1.354,
        0.7,0.8,        0.4,0.8,        0.133,1.354,
        0.7,0.8,        0.133,1.354,    0.633,1.25,
        //right in
        1,   0,      0.33,0,        0.357, 0.267,
        1,   0,      0.74,0.267,    0.357, 0.267,
        0.69,0.8,    1,   0,        0.74,  0.267,
        0.69,0.8,    1,   0,        0.9267,0.8,
        //front in
        0.36,0.267,   0.33,0,      1,0,
        1,0,      0.36,0.267,   0.745,0.267,
        0.9267,0.8,     1,0,      0.7,0.8,
        0.7,0.8,    1,0,      0.745,0.267,
        //front out
        0,0,      0.33,0,      0.133,1.4,
        0.33,0,      0.4,0.8,     0.133,1.4,
        0.133,1.4,      0.4,0.8,     0.917,0.8,
        0.133,1.4,      0.867,1.25,    0.917,0.8,
        //right out
        0.1, 1.1,     0.33,  0,       0,    0,
        0.33,0,       0.4,   0.8,     0.1,  1.1,
        0.1, 1.1,     0.4,   0.8,     0.917,0.8,
        0.1, 1.1,     0.8675,1.25,    0.917,0.8,
        //top out
        0.633,0.133,    0.867,0.133,      0.8675,0.867,
        0.633,0.133,    0.67, 0.633,      0.8675,0.867,
        0.67,0.1,    0.9,0.1,      0.867,0.8675,
        0.67,0.1,    0.633,0.67,     0.867,0.8675
      ];
      var arrays = {
        vPosition : { numComponents: 3, data: pos },
        vNormal : { numComponents: 3, data: norms },
        vTexCorrd: { numComponents: 2, data: texCoord}
      };
      this.buffers = twgl.createBufferInfoFromArrays(gl,arrays);
    }
  };

  Headquarter.prototype.draw = function(drawingState,shadow) {
    var gl = drawingState.gl;
    var modelM = m4.scaling([this.size,this.size,this.size]);
    m4.setTranslation(modelM,this.position,modelM);

    gl.useProgram(shaderProgram.program);
    twgl.setBuffersAndAttributes(gl,shaderProgram,this.buffers);
    twgl.setUniforms(shaderProgram,{
      view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
      lightColor:drawingState.sunColor, model: modelM, objColor: this.color,
      shadowRangeNearFar:shadow.shadowRangeNearFar,lightPosition:shadow.lightPosition
    });

    shaderProgram.program.shadowMapCube = gl.getUniformLocation(shaderProgram.program, "shadowMapCube");
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadow.shadowMapCube);
    gl.uniform1i(shaderProgram.program.shadowMapCube,0);

    twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers);
  };
  Headquarter.prototype.center = function(drawingState){
    return twgl.v3.add(this.position,[1.5,1.5,2.0]);
  }
})();

//grobjects.push(new Headquarter([-40,0.02,-25],8.0));
//grobjects.push(new Headquarter([-40,0.02,10],8.0));
