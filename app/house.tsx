'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
type Part={mesh:THREE.Mesh;target:THREE.Vector3;offset:THREE.Vector3};
export default function House({active,exploded,replay}:{active:boolean;exploded:boolean;replay:number}){const mount=useRef<HTMLDivElement>(null);const parts=useRef<Part[]>([]);const drive=useRef<gsap.core.Timeline|null>(null);const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);
useEffect(()=>{if(!active||!mount.current)return;const el=mount.current;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true})}catch{setFailed(true);return}renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;el.appendChild(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);camera.position.set(10,8,12);camera.lookAt(0,2,0);camera.updateMatrixWorld();const envScene=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(envScene,.04);scene.environment=env.texture;scene.environmentIntensity=.35;envScene.dispose();const group=new THREE.Group();scene.add(group);scene.add(new THREE.AmbientLight(0xffffff,.75));const sun=new THREE.DirectionalLight(0xfff2da,3.6);sun.position.set(-4,10,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});sun.shadow.normalBias=.03;scene.add(sun);const fill=new THREE.DirectionalLight(0xe5eeff,1.1);fill.position.set(8,4,-5);scene.add(fill);
const concrete=new THREE.MeshStandardMaterial({color:0xd6d4c6,roughness:.87});const lightConcrete=new THREE.MeshStandardMaterial({color:0xe8e6da,roughness:.78});const dark=new THREE.MeshStandardMaterial({color:0x34392f,roughness:.6});const wood=new THREE.MeshStandardMaterial({color:0x9d6f46,roughness:.8});const glass=new THREE.MeshPhysicalMaterial({color:0x718d86,metalness:.15,roughness:.15,transparent:true,opacity:.46,side:THREE.DoubleSide});const terra=new THREE.MeshStandardMaterial({color:0xea592f,roughness:.9});
// Fine material texture, generated as data rather than external assets.
function surfaceTexture(kind:'stone'|'timber'){const n=128,data=new Uint8Array(n*n*4);let seed=17;for(let y=0;y<n;y++)for(let x=0;x<n;x++){seed=(seed*16807)%2147483647;const noise=(seed%100)/100;const tone=kind==='stone'?210+noise*40:175+Math.sin(x*.52+Math.sin(y*.035)*1.8)*19+noise*25;const at=(y*n+x)*4;data[at]=data[at+1]=data[at+2]=tone;data[at+3]=255}const t=new THREE.DataTexture(data,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='stone'?3:2,kind==='stone'?3:1);t.needsUpdate=true;return t}
const stoneTex=surfaceTexture('stone'),timberTex=surfaceTexture('timber');concrete.bumpMap=stoneTex;concrete.bumpScale=.022;lightConcrete.bumpMap=stoneTex;lightConcrete.bumpScale=.012;wood.map=timberTex;wood.bumpMap=timberTex;wood.bumpScale=.018;glass.opacity=.29;glass.envMapIntensity=1.4;
const list:Part[]=[];function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material,off:number[]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);list.push({mesh,target:mesh.position.clone(),offset:new THREE.Vector3(...off as [number,number,number])});return mesh}
box(9.1,.18,6.6,0,0,0,lightConcrete,[0,-2,0]);box(6.7,.28,4.1,0,.3,-.2,concrete,[-5,0,0]);
// Ground-floor rear wall and side walls.
box(6.3,2.2,.18,0,1.5,-1.9,concrete,[0,1,-6]);box(.2,2.2,3.5,-3.05,1.5,-.1,concrete,[-5,1,0]);box(.2,2.2,3.5,3.05,1.5,-.1,lightConcrete,[5,1,0]);box(.16,2.2,2.2,.8,1.5,-.8,wood,[0,4,-2]);
// Warm timber core, glass facade and finely spaced mullions.
box(1.55,1.85,1.3,1.9,1.35,-1.1,wood,[6,3,0]);box(5.75,2.1,.05,0,1.46,1.54,glass,[0,1,6]);for(let i=0;i<6;i++)box(.045,2.18,.08,-2.9+i*1.16,1.48,1.58,dark,[0,2,5]);box(6,.055,.1,0,.43,1.58,dark,[0,0,6]);
// Cantilever slab and an offset upper volume.
box(7.15,.22,4.25,.1,2.69,-.2,lightConcrete,[0,5,0]);box(4.5,1.8,.16,-.65,3.69,-1.9,concrete,[0,4,-4]);box(.18,1.8,3.2,-2.8,3.69,-.35,concrete,[-5,4,0]);box(4.25,1.72,.05,-.6,3.69,1.17,glass,[0,3,5]);box(.18,1.8,3.2,1.55,3.69,-.35,wood,[5,4,0]);for(let i=0;i<5;i++)box(.04,1.8,.07,-2.75+i*1.06,3.69,1.21,dark,[0,3,5]);box(4.85,.22,3.8,-.63,4.68,-.35,lightConcrete,[0,7,0]);
// Brise-soleil and entrance steps.
for(let i=0;i<10;i++)box(.08,1.78,.18,1.65,3.69,-1.75+i*.3,wood,[4,3,0]);for(let i=0;i<3;i++)box(2.1,.12, .4,-1,.10+i*.09,2.4-i*.3,concrete,[0,-1,4]);box(.55,.5,.55,2.65,.6,2.05,terra,[4,0,3]);
// Simple planted terrace, rendered as real 3D geometry.
const foliage=new THREE.MeshStandardMaterial({color:0x6d7954,roughness:1});const plant=new THREE.Mesh(new THREE.IcosahedronGeometry(.43,1),foliage);plant.scale.set(.8,1.5,.8);plant.position.set(2.65,1.18,2.05);plant.castShadow=true;group.add(plant);list.push({mesh:plant,target:plant.position.clone(),offset:new THREE.Vector3(4,0,3)});
// Interior furnishings: sofa, linen cushions, low table, rug and upstairs bed.
const linen=new THREE.MeshStandardMaterial({color:0xe9e3d3,roughness:1});const cushion=new THREE.MeshStandardMaterial({color:0xb78a5e,roughness:1});const rug=new THREE.MeshStandardMaterial({color:0xb6b7a2,roughness:1});
box(2,.025,1.6,-1.3,.458,.1,rug,[0,0,0]);box(1.85,.28,.68,-1.4,.64,-.6,linen,[0,0,0]);box(1.85,.55,.17,-1.4,.9,-.92,linen,[0,0,0]);for(let i=0;i<3;i++)box(.55,.12,.53,-1.98+i*.59,.84,-.55,linen,[0,0,0]);box(.13,.36,.73,-2.31,.75,-.6,linen,[0,0,0]);box(.13,.36,.73,-.49,.75,-.6,linen,[0,0,0]);box(.35,.33,.12,-1.96,1,-.8,cushion,[0,0,0]);box(.36,.32,.12,-.85,1,-.8,rug,[0,0,0]);box(1,.075,.55,-1.35,.71,.47,wood,[0,0,0]);for(const x of [-1.7,-1])for(const z of [.3,.64])box(.045,.23,.045,x,.565,z,dark,[0,0,0]);box(.25,.045,.2,-1.12,.77,.47,terra,[0,0,0]);
box(1.45,.19,1.7,-1.45,2.93,-.35,wood,[0,5,0]);box(1.4,.17,1.66,-1.45,3.1,-.35,linen,[0,5,0]);box(1.4,.025,.65,-1.45,3.2,.12,rug,[0,5,0]);box(.54,.11,.32,-1.82,3.23,-.93,linen,[0,5,0]);box(.54,.11,.32,-1.11,3.23,-.93,linen,[0,5,0]);
// Door pulls, roof fascia, terrace railing and timber deck joints.
for(const x of [-.12,.12])box(.025,.32,.035,x,1.38,1.61,wood,[0,1,6]);box(4.85,.045,3.8,-.63,4.56,-.35,dark,[0,7,0]);
for(let i=0;i<7;i++)box(.04,.78,.04,1.9+i*.19,3.19,1.49,dark,[0,5,0]);box(1.35,.04,.055,2.47,3.59,1.49,dark,[0,5,0]);box(.055,.04,3.2,3.1,3.59,-.08,dark,[0,5,0]);for(let i=0;i<6;i++)box(.04,.78,.04,3.1,3.19,-1.55+i*.55,dark,[0,5,0]);
for(let i=0;i<19;i++)box(.16,.04,1.07,-1.7+i*.175,.13,2.69,wood,[0,-.3,0]);
const warm=new THREE.MeshStandardMaterial({color:0xffe6b5,emissive:0xffc676,emissiveIntensity:1.2});box(5.5,.026,.032,0,2.56,1.42,warm,[0,5,0]);box(3.9,.022,.03,-.6,4.55,1.1,warm,[0,7,0]);
// Garden planter with varied rounded shrubs and a slender olive tree.
box(.52,.24,3,-3.76,.22,-.2,concrete,[0,0,0]);const soil=new THREE.MeshStandardMaterial({color:0x423b2c,roughness:1});box(.46,.02,2.92,-3.76,.35,-.2,soil,[0,0,0]);
const leaves=[foliage,new THREE.MeshStandardMaterial({color:0x879064,roughness:1}),new THREE.MeshStandardMaterial({color:0x536349,roughness:1})];function organic(geo:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;group.add(m);list.push({mesh:m,target:m.position.clone(),offset:new THREE.Vector3()});return m}
for(let i=0;i<8;i++)organic(new THREE.SphereGeometry(.27,9,7),leaves[i%3],-3.76+(i%2)*.06,.49,-1.4+i*.34,1,1+(i%3)*.2,1);
organic(new THREE.CylinderGeometry(.035,.065,1.7,8),wood,3.8,.94,-2.42);for(let i=0;i<9;i++){const a=i*2.4;organic(new THREE.SphereGeometry(.34,10,8),leaves[i%3],3.8+Math.cos(a)*.35,1.55+(i%3)*.26,-2.42+Math.sin(a)*.3,1,.8,1)}
// Small recessed garden lights and concrete panel joints.
for(const z of [-1.2,.15,1.5]){box(.08,.27,.08,4.03,.28,z,dark,[0,0,0]);box(.06,.04,.065,4.03,.425,z,warm,[0,0,0])}
const seam=new THREE.MeshStandardMaterial({color:0xafb0a3,roughness:1});for(let i=0;i<5;i++)box(.009,.005,6.4,-3.6+i*1.8,.095,0,seam,[0,0,0]);
// A complete residential plot: attached garage, two parking bays and gardens.
const lawn=new THREE.MeshStandardMaterial({color:0x7d9161,roughness:1});
const gravel=new THREE.MeshStandardMaterial({color:0xb4b3a4,roughness:1,bumpMap:stoneTex,bumpScale:.045});
const paving=new THREE.MeshStandardMaterial({color:0x8a8b81,roughness:.94,bumpMap:stoneTex,bumpScale:.018});
const whiteMark=new THREE.MeshStandardMaterial({color:0xe8e4d4,roughness:.8});
box(12.5,.22,10.4,1,-.22,1.5,concrete,[0,0,0]);
box(4.3,.06,4.25,4.45,.02,-.18,paving,[0,0,0]);
// Garage shares the house's architectural language; its roof lifts with the assembly.
box(.16,2.28,4.1,6.48,1.18,-.25,concrete,[4,2,0]);
box(3.2,2.28,.16,4.96,1.18,-2.22,concrete,[0,2,-3]);
box(3.5,.18,4.3,4.9,2.42,-.22,lightConcrete,[0,5,0]);
box(.15,2.28,.17,3.35,1.18,1.76,dark,[0,2,2]);
box(.14,2.28,.17,6.48,1.18,1.76,dark,[0,2,2]);
box(3.05,.3,.12,4.92,2.14,1.78,dark,[0,3,2]);
for(let i=0;i<4;i++)box(3.0,.11,.055,4.92,2.11-i*.12,1.79,wood,[0,3,2]);
box(2.8,.025,.03,4.9,2.28,1.6,warm,[0,5,0]);
// Tool storage and an EV charger inside the open garage.
box(.35,1.45,1.25,6.15,.79,-1.12,wood,[0,0,0]);
box(.2,.5,.28,3.5,1.22,.45,dark,[0,0,0]);box(.022,.18,.17,3.62,1.3,.45,warm,[0,0,0]);
const cable=new THREE.Mesh(new THREE.TorusGeometry(.17,.017,6,18),dark);cable.rotation.y=Math.PI/2;cable.position.set(3.64,.88,.45);group.add(cable);list.push({mesh:cable,target:cable.position.clone(),offset:new THREE.Vector3()});
// Driveway, divided guest parking and low wheel stops.
box(4.25,.055,4.82,4.5,-.02,4.18,paving,[0,0,0]);
for(let i=0;i<3;i++)box(.035,.012,2.55,2.69+i*1.8,.016,4.25,whiteMark,[0,0,0]);
for(const x of [3.58,5.38]){box(1.75,.013,.035,x,.018,5.55,whiteMark,[0,0,0]);if(x>4)box(.82,.1,.12,x,.07,2.99,concrete,[0,0,0]);}
for(let i=0;i<10;i++)box(4.15,.01,.012,4.5,.013,1.98+i*.46,seam,[0,0,0]);
// Detailed miniature cars with glazing, alloys, lamps, mirrors and body seams.
const tyre=new THREE.MeshStandardMaterial({color:0x20231f,roughness:.95});const alloy=new THREE.MeshStandardMaterial({color:0xaab0aa,metalness:.85,roughness:.25});const autoGlass=new THREE.MeshPhysicalMaterial({color:0x263f42,metalness:.35,roughness:.12,clearcoat:1});const tailLamp=new THREE.MeshStandardMaterial({color:0xc93627,emissive:0x9f251c,emissiveIntensity:.35});
function car(x:number,z:number,color:number){const first=list.length;const vehicle=new THREE.Group();group.add(vehicle);const paint=new THREE.MeshPhysicalMaterial({color,metalness:.45,roughness:.22,clearcoat:1});function part(w:number,h:number,d:number,px:number,py:number,pz:number,mat:THREE.Material,r=.035){const m=organic(new RoundedBoxGeometry(w,h,d,2,r),mat,x+px,py,z+pz);return m}
part(.96,.31,1.95,0,.37,0,paint,.09);part(.81,.32,1.02,0,.66,-.14,autoGlass,.08);part(.8,.055,.77,0,.835,-.19,paint,.025);part(.94,.025,.47,0,.55,.67,paint,.025);part(.92,.055,.2,0,.49,-.88,paint,.025);
for(const sx of [-1,1])for(const zz of [-.62,.62]){const wheel=organic(new THREE.CylinderGeometry(.205,.205,.13,18),tyre,x+sx*.475,.24,z+zz);wheel.rotation.z=Math.PI/2;const rim=organic(new THREE.CylinderGeometry(.127,.127,.139,12),alloy,x+sx*.479,.24,z+zz);rim.rotation.z=Math.PI/2;}
for(const side of [-1,1]){part(.25,.055,.025,side*.28,.43,.981,warm,.01);part(.25,.045,.025,side*.29,.46,-.981,tailLamp,.01);part(.115,.06,.14,side*.46,.68,.22,paint,.02);part(.016,.025,.11,side*.486,.51,-.2,alloy,.005);part(.015,.28,.035,side*.412,.68,-.1,paint,.005);}
part(.52,.07,.027,0,.28,.99,dark,.008);part(.18,.065,.025,0,.36,1.001,whiteMark,.005);
const wheels:THREE.Mesh[]=[];for(const item of list.slice(first)){item.mesh.position.x-=x;item.mesh.position.z-=z;item.target.copy(item.mesh.position);vehicle.add(item.mesh);if(item.mesh.geometry instanceof THREE.CylinderGeometry)wheels.push(item.mesh)}vehicle.position.set(x,0,z);return {vehicle,wheels};}
const arrivingCar=car(0,0,0xe4e2d7);car(5.38,4.25,0x45584b);
// A real finite street, with a clear driveway entrance, rather than a background plane.
const asphalt=new THREE.MeshStandardMaterial({color:0x51564f,roughness:1,bumpMap:stoneTex,bumpScale:.025});
box(12.5,.16,2.5,1,-.13,7.94,asphalt,[0,0,0]);
for(let i=0;i<10;i++)box(.62,.012,.035,-4.5+i*1.25,-.043,8.67,whiteMark,[0,0,0]);
box(7.35,.12,.28,-1.58,-.04,6.73,lightConcrete,[0,0,0]);box(.66,.12,.28,6.91,-.04,6.73,lightConcrete,[0,0,0]);
const path=new THREE.CurvePath<THREE.Vector3>();
path.add(new THREE.LineCurve3(new THREE.Vector3(-4,0,7.65),new THREE.Vector3(1.7,0,7.65)));
path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(1.7,0,7.65),new THREE.Vector3(3.05,0,7.65),new THREE.Vector3(4.15,0,6.95),new THREE.Vector3(4.15,0,5.65)));
path.add(new THREE.LineCurve3(new THREE.Vector3(4.15,0,5.65),new THREE.Vector3(4.15,0,-.15)));
const travel={progress:0};const pathLength=path.getLength();const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function positionCar(){const pos=path.getPointAt(travel.progress);const tangent=path.getTangentAt(travel.progress);arrivingCar.vehicle.position.copy(pos);arrivingCar.vehicle.rotation.y=Math.atan2(tangent.x,tangent.z);for(const wheel of arrivingCar.wheels)wheel.rotation.x=-travel.progress*pathLength/.205}
travel.progress=reducedMotion?1:0;positionCar();
if(!reducedMotion){drive.current=gsap.timeline({delay:3.2,onUpdate:positionCar}).to(travel,{progress:.36,duration:3.2,ease:'power1.in'}).to(travel,{progress:.63,duration:3.3,ease:'none'}).to(travel,{progress:1,duration:3.6,ease:'power2.out'})}

// Lawn, stepping stones and a timber pergola lounge.
box(6.95,.055,3.14,-.92,-.015,4.92,lawn,[0,0,0]);box(1.2,.048,3.4,-1,.022,4.84,gravel,[0,0,0]);
for(let i=0;i<6;i++)box(.87,.05,.39,-1,.071,3.55+i*.54,lightConcrete,[0,0,0]);
box(2.42,.1,2.35,-3.05,.075,4.67,wood,[0,0,0]);for(let i=0;i<13;i++)box(.018,.01,2.3,-4.2+i*.19,.132,4.67,dark,[0,0,0]);
for(const x of [-4.11,-2.02])for(const z of [3.65,5.69])box(.1,1.83,.1,x,1.01,z,wood,[0,0,0]);
for(let i=0;i<11;i++)box(.095,.105,2.34,-4.16+i*.22,1.97,4.67,wood,[0,2,0]);
box(1.8,.19,.48,-3.05,.4,5.23,linen,[0,0,0]);box(1.8,.45,.12,-3.05,.68,5.46,linen,[0,0,0]);box(.72,.065,.51,-3.05,.43,4.43,wood,[0,0,0]);for(const x of [-3.31,-2.79])box(.05,.26,.38,x,.28,4.43,dark,[0,0,0]);
// Planted borders, flower beds and mature trees frame the plot without hiding the house.
for(const x of [-4.68,7.0]){box(.28,.22,9.85,x,.01,1.5,concrete,[0,0,0]);for(let i=0;i<18;i++)organic(new THREE.SphereGeometry(.25,8,6),leaves[i%3],x,.32,-3+i*.52,.85,1.25,1);}
const flower=new THREE.MeshStandardMaterial({color:0xd8b385,roughness:1});
for(let i=0;i<14;i++){const x=.05+(i%7)*.31,z=5.72+Math.floor(i/7)*.38;organic(new THREE.SphereGeometry(.15,7,5),leaves[i%3],x,.16,z,1,.8,1);organic(new THREE.SphereGeometry(.045,6,4),flower,x+.04,.31,z);}
function gardenTree(x:number,z:number,h:number){organic(new THREE.CylinderGeometry(.035,.075,h,8),wood,x,h/2,z);for(let i=0;i<11;i++){const angle=i*2.4;organic(new THREE.SphereGeometry(.39,8,6),leaves[i%3],x+Math.cos(angle)*.45,h-.15+(i%3)*.29,z+Math.sin(angle)*.42,1,1.1,1);}}
gardenTree(-4.05,2.95,1.8);gardenTree(.88,5.12,1.9);gardenTree(6.67,-2.65,2.25);
// Entry walls, mailbox and path lighting; the vehicle entrance stays open.
box(6.6,.43,.15,-1.18,.105,6.64,lightConcrete,[0,0,0]);box(.35,.87,.35,2.34,.32,6.56,concrete,[0,0,0]);box(.2,.14,.08,2.34,.55,6.77,dark,[0,0,0]);
for(const z of [3.55,4.63,5.72]){box(.065,.32,.065,-.29,.16,z,dark,[0,0,0]);box(.07,.04,.07,-.29,.34,z,warm,[0,0,0]);}

// Transparent scene: no infinite floor or grid that can reveal the canvas edges.
parts.current=list;setReady(true);
let visible=true,raf=0;let mx=0,my=0;const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*.18;my=((e.clientY-r.top)/r.height-.5)*.05};el.addEventListener('pointermove',move);const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting});observer.observe(el);let aspect=1;const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);aspect=w/Math.max(h,1)};const ro=new ResizeObserver(resize);ro.observe(el);resize();
// Fit the actual moving model in camera space, including every exploded layer.
// The camera is no longer tied to a fixed crop or a screen-specific magic size.
const corner=new THREE.Vector3();const frame=()=>{raf=requestAnimationFrame(frame);if(!visible||document.hidden)return;group.rotation.y+=(mx-group.rotation.y)*.04;group.rotation.x+=(my-group.rotation.x)*.04;group.updateMatrixWorld(true);let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
// Project each part rather than a large empty bounding cube: the estate fills the frame.
for(const p of list){if(!p.mesh.geometry.boundingBox)p.mesh.geometry.computeBoundingBox();const b=p.mesh.geometry.boundingBox!;for(let i=0;i<8;i++){corner.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(p.mesh.matrixWorld).applyMatrix4(camera.matrixWorldInverse);left=Math.min(left,corner.x);right=Math.max(right,corner.x);bottom=Math.min(bottom,corner.y);top=Math.max(top,corner.y)}}const halfH=Math.max((top-bottom)/2,(right-left)/(2*aspect))*1.075;const cx=(left+right)/2,cy=(top+bottom)/2;camera.left=cx-halfH*aspect;camera.right=cx+halfH*aspect;camera.top=cy+halfH;camera.bottom=cy-halfH;camera.updateProjectionMatrix();renderer.render(scene,camera)};frame();return()=>{cancelAnimationFrame(raf);drive.current?.kill();drive.current=null;ro.disconnect();observer.disconnect();el.removeEventListener('pointermove',move);list.forEach(p=>gsap.killTweensOf(p.mesh.position));scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});stoneTex.dispose();timberTex.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();parts.current=[];setReady(false)}},[active]);
useEffect(()=>{if(!ready)return;if(replay>0)drive.current?.restart(true);const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;parts.current.forEach((p,i)=>{gsap.killTweensOf(p.mesh.position);p.mesh.position.copy(p.target).addScaledVector(p.offset,.42);gsap.to(p.mesh.position,{x:p.target.x,y:p.target.y,z:p.target.z,duration:reduce?0:1.65,delay:reduce?0:.15+Math.min(i,42)*.032,ease:'power3.out'})})},[ready,replay]);
useEffect(()=>{if(!ready)return;parts.current.forEach((p,i)=>{gsap.to(p.mesh.position,{x:p.target.x+(exploded?p.offset.x*.32:0),y:p.target.y+(exploded?p.offset.y*.42:0),z:p.target.z+(exploded?p.offset.z*.32:0),duration:1.2,delay:Math.min(i,42)*.005,ease:'power3.inOut',overwrite:true})})},[exploded]);
return <div className="house-canvas" ref={mount} role="img" aria-label="Interactive villa estate with an attached garage, two cars, parking bays, garden paths and a pergola. Its floors, walls, windows and roofs assemble in sequence.">{failed&&<img className="house-fallback" src="/images/villa.jpg" alt="Modern concrete house"/>}</div>}
