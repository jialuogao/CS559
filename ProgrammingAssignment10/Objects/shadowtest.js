//this file is only for testing shadows
var grobjects = grobjects || [];
(function() {
    "use strict";
    var groundPlaneSize = groundPlaneSize || 10;

    // putting the arrays of object info here as well
    var pos = [
        -groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0,  groundPlaneSize,
        -groundPlaneSize, 0, -groundPlaneSize,
         groundPlaneSize, 0,  groundPlaneSize,
        -groundPlaneSize, 0,  groundPlaneSize
    ];
    var texc = [
      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1
    ];
    // since there will be one of these, just keep info in the closure
    var shaderProgram = undefined;
    var buffers = undefined;
    var image = undefined;
    var texture = undefined;
    // define the pyramid object
    // note that we cannot do any of the initialization that requires a GL context here
    // we define the essential methods of the object - and then wait
    //
    // another stylistic choice: I have chosen to make many of my "private" variables
    // fields of this object, rather than local variables in this scope (so they
    // are easily available by closure).
    var ground = {
        // first I will give this the required object stuff for it's interface
        // note that the init and draw functions can refer to the fields I define
        // below
        name : "test",
        // the two workhorse functions - init and draw
        // init will be called when there is a GL context
        // this code gets really bulky since I am doing it all in place
        init : function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;
            if (!shaderProgram) {
                //shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);                shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);
                shaderProgram = twgl.createProgramInfo(gl,["shadow-vs","shadow-fs"]);
            }
            var norms = [];
            var v1 = new Float32Array([pos[0]-pos[3],pos[1]-pos[4],pos[2]-pos[5]]);
            var v2 = new Float32Array([pos[0]-pos[6],pos[1]-pos[7],pos[2]-pos[8]]);
            var n = twgl.v3.normalize(twgl.v3.cross(v1,v2));
            n[0]=-n[0];
            n[1]=-n[1];
            n[2]=-n[2];
            for(var j = 0; j<pos.length ; j+=3){
                norms.push(n[0]);
                norms.push(n[1]);
                norms.push(n[2]);
            }
            var arrays = {
              vPosition : { numComponents: 3, data: pos },
              vNormal : { numComponents: 3, data: norms },
              vTexCorrd: { numComponents: 2, data: texc}
            };
            buffers = twgl.createBufferInfoFromArrays(gl,arrays);
            gl.useProgram(shaderProgram.program);


            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

       },
        draw : function(drawingState,shadow) {
            var gl = drawingState.gl;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, shadow.shadowMap);


            gl.useProgram(shaderProgram.program);
            twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
            twgl.setUniforms(shaderProgram,{
              view:drawingState.view, proj:drawingState.proj,
              model: twgl.m4.identity()
            });
            shaderProgram.program.shadowMap = gl.getUniformLocation(shaderProgram.program, "shadowMap");
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, shadow.shadowMap);
            gl.uniform1i(shaderProgram.program.shadowMap,0);
            twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
        },
        center : function(drawingState) {
            return [0,0,0];
        }

    };
    function LoadTexture(gl,texture,image){
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    };
    // now that we've defined the object, add it to the global objects list
    grobjects.push(ground);
})();
