/**
 * Created by gleicher on 10/9/2015.
 */

/**
 this is even simpler than the simplest object - it's a ground plane underneath
 the objects (at Z=0) - just a big plane. all coloring handled in the vertex
 shader. no normals. it's just a checkerboard that is simple.

 no normals, but a funky shader

 however, I am going to do it with TWGL to keep the code size down
 **/

// this defines the global list of objects
    // if it exists already, this is a redundant definition
    // if it isn't create a new array
var grobjects = grobjects || [];

// a global variable to set the ground plane size, so we can easily adjust it
// in the html file (before things run
// this is the +/- in the X and Z direction (so things will go from -5 to +5 by default)
var groundPlaneSize = groundPlaneSize || 50;

// now, I make a function that adds an object to that list
// there's a funky thing here where I have to not only define the function, but also
// run it - so it has to be put in parenthesis
(function() {
    "use strict";

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
      0,0, 0.65,0, 0.65,1,
      0,0, 0.65,1, 0,1
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
        name : "Ground Plane",
        // the two workhorse functions - init and draw
        // init will be called when there is a GL context
        // this code gets really bulky since I am doing it all in place
        init : function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;
            if (!shaderProgram) {
                //shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);                shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);
                shaderProgram = twgl.createProgramInfo(gl,["ground-vs","ground-fs"]);
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
            texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            image = new Image();

          	image.src = "";
            image.onload = function(){
                LoadTexture(gl,texture,image);
            }

       },
        draw : function(drawingState) {
            var gl = drawingState.gl;
            gl.useProgram(shaderProgram.program);
            twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
            twgl.setUniforms(shaderProgram,{
              view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
              lightColor:drawingState.sunColor, model: twgl.m4.identity(), objColor: [1,1,1]});
            shaderProgram.program.uTexture = gl.getUniformLocation(shaderProgram.program, "uTexture");
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(shaderProgram.program.uTexture,0);
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
