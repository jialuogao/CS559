var grobjects = grobjects || [];

var Birdsnest = undefined;

(function(){
  "use strict";
  var shaderProgram = undefined;
  var textureArray = new Array();
  var imageArray = new Array();
  var meshes = loaded_model["Birdsnest.obj"].meshes;
  var numMeshes = loaded_model["Birdsnest.obj"].mesh_number;
  var texture = undefined;
  Birdsnest = function Birdsnest(position, size){
    this.name = "Bird's Net";
    this.position = position || [0,0,0];
    this.size = size || 1.0;
    this.buffers = new Array();
    this.model = twgl.m4.scaling([1/100000,1/100000,1/100000]);
  }
  Birdsnest.prototype.init = function(drawingState){
    var gl = drawingState.gl;
    this.model = m4.multiply(m4.scaling([this.size,this.size,this.size]),this.model);
    m4.setTranslation(this.model,this.position,this.model);
    if(!shaderProgram){
      shaderProgram = twgl.createProgramInfo(gl, ["birdsnest-vs", "birdsnest-fs"]);
    }

    if(this.buffers.length==0){
      for(var i =0; i <numMeshes; i++){
        var v = new Array();
        var n = new Array();
        var t = new Array();
        var faces = meshes[i].face || new Array();
        var ver = meshes[i].position || new Array();
        var tex = meshes[i].uv || new Array();
        var nor = meshes[i].normal;
        for(var j=0; j<faces.length;j++){
          var face = faces[j];
          for(var k=0;k<face.length;k++){
            var vt = ver[face[k]];
            var tt = tex[face[k]];
            var nt = nor[face[k]];
            //console.log("b4 log "+i+" "+j+" "+k);
            // if(twgl.v3.dot([0,1,0],nt)<0){
            //    nt = twgl.v3.negate(nt);
            //    //console.log(i+" "+j+" "+k);
            // }
            if(tt==undefined){
              tt=[0,0];
            }
            if(vt==undefined){
              vt=[0,0,0];
            }
            if(nt==undefined){
              nt=[0,0,0]
            }
            v.push(vt[0]);
            v.push(vt[1]);
            v.push(vt[2]);
            t.push(tt[0]);
            t.push(tt[1]);
            n.push(nt[0]);
            n.push(nt[1]);
            n.push(nt[2]);
          }
        }
        var arrays = {
          vPosition : { numComponents: 3, data: v },
          vNormal : { numComponents: 3, data: n },
          vTexCorrd: { numComponents: 2, data: t}
        }
        this.buffers.push(twgl.createBufferInfoFromArrays(gl,arrays));

        gl.useProgram(shaderProgram.program);
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        textureArray.push(texture);
        imageArray.push(initTexture(gl,texture,meshes[i]));
      }
    }
  };

  Birdsnest.prototype.draw = function(drawingState) {
    var gl = drawingState.gl;
    gl.useProgram(shaderProgram.program);
    for(var i = 0; i<numMeshes ; i++){
      twgl.setBuffersAndAttributes(gl,shaderProgram,this.buffers[i]);
      twgl.setUniforms(shaderProgram,{
        view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
        lightColor:drawingState.sunColor, model: this.model
      });
      if(imageArray[i]!=null){
        shaderProgram.program.uTexture = gl.getUniformLocation(shaderProgram.program, "uTexture");
        switch (meshes[i].texture[0]) {
          case 0:
          gl.activeTexture(gl.TEXTURE0);
          break;
          case 1:
          gl.activeTexture(gl.TEXTURE1);
          break;
          case 2:
          gl.activeTexture(gl.TEXTURE2);
          break;
          case 3:
          gl.activeTexture(gl.TEXTURE3);
          break;
          default:
          break;
        }
        gl.bindTexture(gl.TEXTURE_2D, textureArray[i]);
        gl.uniform1i(shaderProgram.program.uTexture, meshes[i].texture[0]);
      }
      twgl.drawBufferInfo(gl, gl.TRIANGLES, this.buffers[i]);
    }
  };
  Birdsnest.prototype.center = function(drawingState){
    return this.position;
  }

  function LoadTexture(gl,texture,image){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  };

  function initTexture(gl,texture,mesh)
  {
    var image = new Image();
    if(mesh.texture.length!=0){
      image.src = loaded_model["Birdsnest.obj"].textures[(mesh.texture)[0]].src;
      image.onload = function(){
        LoadTexture(gl,texture,image);
      }
    } else {
      image=null;
    }
    return image;
  }
})();


grobjects.push(new Birdsnest([10,0.02,-25],9.0));
