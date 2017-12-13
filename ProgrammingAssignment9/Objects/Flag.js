var grobjects = grobjects || [];

var Flag = undefined;

(function() {
    "use strict";
    var shaderProgram = undefined;
    var buffers = undefined;

    Flag = function Flag(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [1.0,0.0,0.0];
    }
    Flag.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
        if (!buffers) {
          var fpos = [
            //bar
            -.05,-1.05,-.05,  .05,-1.05,-.05,  .05, 1.05,-.05,
            -.05,-1.05,-.05,  .05, 1.05,-.05, -.05, 1.05,-.05,
            -.05,-1.05, .05,  .05,-1.05, .05,  .05, 1.05, .05,
            -.05,-1.05, .05,  .05, 1.05, .05, -.05, 1.05, .05,
            -.05,-1.05,-.05,  .05,-1.05,-.05,  .05,-1.05, .05,
            -.05,-1.05,-.05,  .05,-1.05, .05, -.05,-1.05, .05,
            -.05, 1.05,-.05,  .05, 1.05,-.05,  .05, 1.05, .05,
            -.05, 1.05,-.05,  .05, 1.05, .05, -.05, 1.05, .05,
            -.05,-1.05,-.05, -.05, 1.05,-.05, -.05, 1.05, .05,
            -.05,-1.05,-.05, -.05, 1.05, .05, -.05,-1.05, .05,
             .05,-1.05,-.05,  .05, 1.05,-.05,  .05, 1.05, .05,
             .05,-1.05,-.05,  .05, 1.05, .05,  .05,-1.05, .05,
            //flag
            1.08,0.3,0,       0,0.3,0,         0,1-.08,0,
            1.08,0.3,0,       1.08,1-.08,0,    0,1-.08,0,
          ]
          var norms = [];
          var v1 = new Float32Array([fpos[0]-fpos[3],fpos[1]-fpos[4],fpos[2]-fpos[5]]);
          var v2 = new Float32Array([fpos[0]-fpos[6],fpos[1]-fpos[7],fpos[2]-fpos[8]]);
          var n = twgl.v3.normalize(twgl.v3.cross(v1,v2));
          n[0]=-n[0];
          n[1]=-n[1];
          n[2]=-n[2];
          for(var j = 0; j<fpos.length ; j+=3){
              norms.push(n[0]);
              norms.push(n[1]);
              norms.push(n[2]);
          }
          var arrays = {
            vpos : { numComponents: 3, data: fpos },
            vnormal : { numComponents: 3, data: norms }
          };
          buffers = twgl.createBufferInfoFromArrays(gl,arrays);
        };
      };
    Flag.prototype.draw = function(drawingState) {
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Flag.prototype.center = function(drawingState) {
        return this.position;
    }
})();
grobjects.push(new Flag("Red Flag",[0.4,4.25,0.5],0.5));
