import * as THREE from "three";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
//import matcap from './matcap/00048.png'
import matcap from './matcap/00003.png'
import { TimelineMax } from "gsap";
import threeOrbitControls from "three-orbit-controls";

let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);

    this.container = document.getElementById("container");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    var frustumSize = 1;
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera( frustumSize / - 2, frustumSize  / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 0);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.paused = false;



    this.setupResize();

    
    this.addObjects();
    this.resize();
    this.render();

    this.setupResize();
    this.mouseEvents();
    this.settings();
  }

  mouseEvents(){
    this.mouse = new THREE.Vector2();
    document.addEventListener('mousemove' , (e)=>{
      this.mouse.x = e.pageX/this.width - 0.5;
      this.mouse.y = -e.pageY/this.height + 0.5;
    })
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0.0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.1);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    // optional - cover with quad
    // const dist  = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    // // if(w/h>1) {
    // if(this.width/this.height>1){
    //   this.plane.scale.x = this.camera.aspect;
    //   // this.plane.scale.y = this.camera.aspect;
    // } else{
    //   this.plane.scale.y = 1/this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();


  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        progress:{value:0},
        mouse:{ value: new THREE.Vector2(0,0) },
        matcap:{ value: new THREE.TextureLoader().load(matcap)},
        time: { value: 0 },
        resolution: {  value: new THREE.Vector4() },
        // uvRate1: {
        //   value: new THREE.Vector2(1, 1)
        // }
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.paused = false;
  }

  play() {
    this.paused = false;
    this.render();
  }

  render() {
    if (this.paused) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time; 
    this.material.uniforms.progress.value = this.settings.progress; 
    if(this.mouse){
    this.material.uniforms.mouse.value = this.mouse;
    }
    
    //console.log(this.mouse) ;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch("container");
