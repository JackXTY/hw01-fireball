import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

export var activeProgram: WebGLProgram = null;

export function setActiveProgram(newActivrProgram: WebGLProgram){
  activeProgram = newActivrProgram;
}

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {

    if(source.indexOf("INCLUDE_TOOL_FUNCTIONS") > 0){
      source = source.replace("INCLUDE_TOOL_FUNCTIONS", require('../../shaders/tool.glsl'));
    }

    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor0: WebGLUniformLocation;
  unifColor1: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifNoiseFreq: WebGLUniformLocation;
  unifShiftScale: WebGLUniformLocation;
  unifShiftFreq: WebGLUniformLocation;
  unifShiftSpeed: WebGLUniformLocation;
  unifShiftSmoothness: WebGLUniformLocation;
  unifDetailFreq: WebGLUniformLocation;
  unifDetailScale: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor0      = gl.getUniformLocation(this.prog, "u_Color0");
    this.unifColor1      = gl.getUniformLocation(this.prog, "u_Color1");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
    this.unifNoiseFreq  = gl.getUniformLocation(this.prog, "u_NoiseFrequency");
    this.unifShiftScale = gl.getUniformLocation(this.prog, "u_ShiftScale");
    this.unifShiftFreq = gl.getUniformLocation(this.prog, "u_ShiftFreq");
    this.unifShiftSpeed = gl.getUniformLocation(this.prog, "u_ShiftSpeed");
    this.unifShiftSmoothness = gl.getUniformLocation(this.prog, "u_ShiftSmoothness");
    this.unifDetailFreq = gl.getUniformLocation(this.prog, "u_DetailFreq");
    this.unifDetailScale = gl.getUniformLocation(this.prog, "u_DetailScale");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      setActiveProgram(this.prog);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor0(color: vec4) {
    this.use();
    if (this.unifColor0 !== -1) {
      gl.uniform4fv(this.unifColor0, color);
    }
  }

  setGeometryColor1(color: vec4) {
    this.use();
    if (this.unifColor1 !== -1) {
      gl.uniform4fv(this.unifColor1, color);
    }
  }

  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }

  setNoiseFreq(noiseFreq: number) {
    this.use();
    if (this.unifNoiseFreq !== -1) {
      gl.uniform1f(this.unifNoiseFreq, noiseFreq);
    }
  }

  setShiftAndDetail(target: {shiftScale : number, shiftFreq : number, shiftSpeed : number, shiftSmoothness : number,
      detailFreq : number, detailScale : number}){
    this.use();
    if (this.unifShiftScale !== -1) {
      gl.uniform1f(this.unifShiftScale, target.shiftScale);
    }
    if (this.unifShiftFreq !== -1) {
      gl.uniform1f(this.unifShiftFreq, target.shiftFreq);
    }
    if (this.unifShiftSpeed !== -1) {
      gl.uniform1f(this.unifShiftSpeed, target.shiftSpeed);
    }
    if (this.unifShiftSmoothness !== -1) {
      gl.uniform1f(this.unifShiftSmoothness, target.shiftSmoothness);
    }
    if (this.unifDetailFreq !== -1) {
      gl.uniform1f(this.unifDetailFreq, target.detailFreq);
    }
    if (this.unifDetailScale !== -1) {
      gl.uniform1f(this.unifDetailScale, target.detailScale);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
