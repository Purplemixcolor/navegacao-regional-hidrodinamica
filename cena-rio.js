(function(){
  'use strict';
  const canvas=document.getElementById('riverScene'),shell=document.getElementById('sceneShell'),fallback=document.getElementById('sceneFallback');
  const $=id=>document.getElementById(id);
  if(!window.THREE){canvas.hidden=true;$('sceneHint').textContent='Embarcação regional · ilustração';return;}
  try{
    const T=THREE,renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.setClearColor(0x08291f,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,120);
    const hemisphere=new T.HemisphereLight(0xe5e4ba,0x123828,2.5);scene.add(hemisphere);
    const sun=new T.DirectionalLight(0xffebc1,3.2);sun.position.set(-7,13,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.camera.near=.5;sun.shadow.camera.far=40;sun.shadow.bias=-.0007;sun.shadow.normalBias=.035;scene.add(sun);
    const rim=new T.DirectionalLight(0x9cbca9,1.3);rim.position.set(8,7,-7);scene.add(rim);
    const mats={cream:new T.MeshStandardMaterial({color:0xe6dec4,roughness:.76}),roof:new T.MeshStandardMaterial({color:0x986b3f,roughness:.63}),wood:new T.MeshStandardMaterial({color:0xb48b55,roughness:.84}),green:new T.MeshStandardMaterial({color:0x155441,roughness:.47,metalness:.05}),gold:new T.MeshStandardMaterial({color:0xc49b52,roughness:.6,metalness:.08}),dark:new T.MeshStandardMaterial({color:0x153b30,roughness:.45}),glass:new T.MeshStandardMaterial({color:0x427a70,roughness:.12,metalness:.3}),rope:new T.MeshStandardMaterial({color:0xe8d6a1,roughness:.8}),tire:new T.MeshStandardMaterial({color:0x172d25,roughness:.92}),red:new T.MeshStandardMaterial({color:0xb67742,roughness:.7})};
    function mesh(geo,mat,parent=scene){const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
    function box(w,h,d,x,y,z,mat,parent){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
    function cylinderBetween(a,b,r,mat,parent=scene){const vA=new T.Vector3(...a),vB=new T.Vector3(...b),dir=new T.Vector3().subVectors(vB,vA),m=mesh(new T.CylinderGeometry(r,r,dir.length(),7),mat,parent);m.position.copy(vA).add(vB).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m;}
    const hullShape=new T.Shape();hullShape.moveTo(-4.7,-1.3);hullShape.lineTo(2.7,-1.3);hullShape.quadraticCurveTo(4.1,-1.22,5.0,0);hullShape.quadraticCurveTo(4.1,1.22,2.7,1.3);hullShape.lineTo(-4.7,1.3);hullShape.quadraticCurveTo(-5.02,0,-4.7,-1.3);
    function hull(depth,mat,parent,y,scale=1){const g=new T.ExtrudeGeometry(hullShape,{depth,bevelEnabled:true,bevelThickness:.04,bevelSize:.05,bevelSegments:2,curveSegments:12});g.rotateX(-Math.PI/2);const m=mesh(g,mat,parent);m.position.y=y;m.scale.setScalar(scale);return m;}
    const boat=new T.Group();scene.add(boat);boat.position.set(-.5,.07,1.0);
    hull(.65,mats.green,boat,-.38);hull(.105,mats.gold,boat,.28);hull(.055,mats.wood,boat,.385);
    box(7.6,.92,2.37,-.85,.93,0,mats.cream,boat);
    box(8.4,.1,2.72,-.78,1.47,0,mats.roof,boat);
    for(let side of [-1,1]){
      for(let i=0;i<11;i++)box(.4,.43,.029,-4.05+i*.62,.98,side*1.2,mats.glass,boat);
      for(let i=0;i<5;i++){
        const x=-4+i*1.5,tire=mesh(new T.TorusGeometry(.16,.056,7,16),mats.tire,boat);tire.position.set(x,.41,side*1.36);tire.rotation.x=side*.1;
        cylinderBetween([x,.65,side*1.36],[x,.51,side*1.36],.016,mats.rope,boat);
      }
    }
    box(7.55,.075,2.35,-.95,1.52,0,mats.wood,boat);
    for(let side of [-1,1]){
      for(let i=0;i<10;i++)box(.055,1.18,.055,-4.15+i*.68,2.10,side*1.10,mats.cream,boat);
      cylinderBetween([-4.25,1.78,side*1.14],[2.12,1.78,side*1.14],.023,mats.cream,boat);
      cylinderBetween([-4.25,1.92,side*1.14],[2.12,1.92,side*1.14],.018,mats.cream,boat);
      const hammocks=[[-2.6,0xb29b5e],[-.65,0x568575]];
      for(const [x,color] of hammocks){const curve=new T.CatmullRomCurve3([new T.Vector3(x-.6,2.05,side*.65),new T.Vector3(x,1.64,side*.65),new T.Vector3(x+.6,2.05,side*.65)]);const h=mesh(new T.TubeGeometry(curve,14,.07,4,false),new T.MeshStandardMaterial({color,roughness:.95}),boat);h.castShadow=false;}
    }
    box(1.77,1.10,2.22,2.02,2.08,0,mats.cream,boat);
    for(const side of [-1,1])box(.83,.55,.022,2.22,2.19,side*1.122,mats.glass,boat);
    box(.025,.62,1.86,2.92,2.19,0,mats.glass,boat);
    box(8.65,.11,2.83,-.80,2.73,0,mats.roof,boat);
    box(8.45,.038,2.68,-.81,2.795,0,mats.gold,boat);
    for(let side of [-1,1]){
      for(let i=0;i<10;i++)cylinderBetween([-4.54+i*.87,2.86,side*1.3],[-4.54+i*.87,3.30,side*1.3],.019,mats.cream,boat);
      cylinderBetween([-4.6,3.31,side*1.3],[3.31,3.31,side*1.3],.022,mats.cream,boat);
      cylinderBetween([-4.6,3.12,side*1.3],[3.31,3.12,side*1.3],.015,mats.cream,boat);
    }
    for(let x of [-4.57,3.30])for(let i=0;i<5;i++)cylinderBetween([x,2.86,-1.25+i*.625],[x,3.3,-1.25+i*.625],.019,mats.cream,boat);
    for(let x of [-4.57,3.3])cylinderBetween([x,3.3,-1.3],[x,3.3,1.3],.022,mats.cream,boat);
    box(1.35,.57,1.27,-2.48,3.11,0,mats.cream,boat);box(1.47,.075,1.36,-2.48,3.44,0,mats.roof,boat);
    for(let side of [-1,1])box(.86,.28,.025,-2.48,3.14,side*.65,mats.glass,boat);
    cylinderBetween([-3.26,2.83,0],[-3.26,4.35,0],.025,mats.gold,boat);
    cylinderBetween([-3.45,4.02,0],[-2.8,4.02,0],.018,mats.gold,boat);
    const flagCanvas=document.createElement('canvas');flagCanvas.width=128;flagCanvas.height=64;const fc=flagCanvas.getContext('2d');fc.fillStyle='#4d7956';fc.fillRect(0,0,128,64);fc.fillStyle='#d1b165';fc.fillRect(0,24,128,16);
    const flagMat=new T.MeshStandardMaterial({map:new T.CanvasTexture(flagCanvas),side:T.DoubleSide,roughness:.9});const flag=mesh(new T.PlaneGeometry(.68,.32,10,2),flagMat,boat);flag.position.set(-2.92,4.15,0);const flagBase=flag.geometry.attributes.position.array.slice();
    const buoy=mesh(new T.TorusGeometry(.18,.057,8,20),mats.red,boat);buoy.position.set(1.3,2.10,1.16);
    const nameCanvas=document.createElement('canvas');nameCanvas.width=512;nameCanvas.height=100;const nc=nameCanvas.getContext('2d');nc.fillStyle='#e6dec4';nc.fillRect(0,0,512,100);nc.fillStyle='#35654f';nc.font='500 45px Arial';nc.textAlign='center';nc.fillText('AMAZÔNIA',256,65);const nameTexture=new T.CanvasTexture(nameCanvas);nameTexture.colorSpace=T.SRGBColorSpace;const nameMat=new T.MeshBasicMaterial({map:nameTexture});const name=mesh(new T.PlaneGeometry(1.73,.34),nameMat,boat);name.position.set(.01,1.29,1.202);name.castShadow=false;
    const waterCanvas=document.createElement('canvas');waterCanvas.width=512;waterCanvas.height=256;const wc=waterCanvas.getContext('2d'),wg=wc.createRadialGradient(256,128,70,256,128,270);wg.addColorStop(0,'white');wg.addColorStop(.62,'#c4c4c4');wg.addColorStop(1,'black');wc.fillStyle=wg;wc.fillRect(0,0,512,256);const alphaTexture=new T.CanvasTexture(waterCanvas);
    const waterGeo=new T.PlaneGeometry(26,15,64,36);waterGeo.rotateX(-Math.PI/2);const waterBase=waterGeo.attributes.position.array.slice();const waterMat=new T.MeshPhongMaterial({color:0x416c5b,specular:0xb0b293,shininess:100,transparent:true,opacity:.94,alphaMap:alphaTexture,depthWrite:false});const water=mesh(waterGeo,waterMat,scene);water.castShadow=false;water.receiveShadow=true;water.renderOrder=2;
    const wakeGroup=new T.Group();scene.add(wakeGroup);const wakeMat=new T.LineBasicMaterial({color:0xb6c4a3,transparent:true,opacity:.42});
    for(const side of [-1,1])for(let j=0;j<3;j++){const points=[];for(let i=0;i<22;i++){const u=i/21;points.push(new T.Vector3(-4.6-u*4.5,.04+j*.004,1+side*(.62+u*(2.15+j*.25))+Math.sin(u*7)*.08));}wakeGroup.add(new T.Line(new T.BufferGeometry().setFromPoints(points),wakeMat));}
    function material(color){return new T.MeshStandardMaterial({color,roughness:1,flatShading:true});}
    const earth=material(0x3b5834),forestMats=[0x416541,0x355c3b,0x284f36,0x587447,0x6e8151].map(material);
    const island=mesh(new T.SphereGeometry(1,36,12),earth,scene);island.scale.set(11,.55,2.65);island.position.set(0,-.18,-6.5);
    let seed=721;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
    for(let i=0;i<48;i++){
      const x=-10+rand()*20,z=-7.4+rand()*1.9,r=.44+rand()*.65,h=.6+rand()*1.0;
      const crown=mesh(new T.IcosahedronGeometry(1,1),forestMats[i%forestMats.length],scene);crown.scale.set(r,h,r*.86);crown.position.set(x,.23+h*.76,z);crown.rotation.y=rand()*6;
      if(i%3===0)cylinderBetween([x,.08,z],[x,.35+h*.8,z],.037,earth,scene);
    }
    function palm(x,z,scale){
      const group=new T.Group();scene.add(group);group.position.set(x,.3,z);group.scale.setScalar(scale);
      const trunkCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.05,1,0),new T.Vector3(.35,2.4,0)]);mesh(new T.TubeGeometry(trunkCurve,12,.054,7,false),mats.wood,group);
      for(let j=0;j<7;j++){
        const a=j*Math.PI*2/7,verts=[],indices=[];for(let i=0;i<=9;i++){const u=i/9,len=u*1.28,half=Math.sin(u*Math.PI)*.115,cx=.35+Math.cos(a)*len,cy=2.4+Math.sin(u*Math.PI)*.20-u*u*.42,cz=Math.sin(a)*len;verts.push(cx-Math.sin(a)*half,cy,cz+Math.cos(a)*half,cx+Math.sin(a)*half,cy,cz-Math.cos(a)*half);if(i<9){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
        const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();const leaf=mesh(g,new T.MeshStandardMaterial({color:0x62824a,roughness:.9,side:T.DoubleSide}),group);leaf.castShadow=false;
      }
    }
    palm(-6.5,-5.05,1.1);palm(6.0,-6.1,1.2);palm(8.2,-5.55,.93);
    const canoe=new T.Group();scene.add(canoe);canoe.position.set(6.4,.035,-2.35);canoe.rotation.y=.1;canoe.scale.set(.29,.5,.31);hull(.37,mats.wood,canoe,-.14);box(5.8,.06,1.6,-.9,.28,0,mats.dark,canoe);box(.85,.8,.55,-4.8,.12,0,mats.dark,canoe);cylinderBetween([-4.9,.1,0],[-5.65,-.25,0],.07,mats.dark,canoe);
    const passenger=mesh(new T.CapsuleGeometry(.17,.48,3,6),forestMats[2],canoe);passenger.position.set(-2.4,.68,0);const head=mesh(new T.SphereGeometry(.18,9,6),mats.wood,canoe);head.position.set(-2.4,1.20,0);
    const distance=18.7,initial={yaw:.52,pitch:.43,distance},desired={...initial},position={...initial};
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,sunset=false,isVisible=true,dragging=false,lastX=0,lastY=0,elapsed=0,lastStamp=0,frameId=null,ready=false,lastRender=0;
    function setPauseButton(){$('scenePause').setAttribute('aria-pressed',String(paused));$('scenePause').setAttribute('aria-label',paused?'Retomar animação da cena':'Pausar animação da cena');$('scenePause').innerHTML=paused?'<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 5 11 7-11 7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>':'<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';}
    function cameraLabels(id){for(const key of ['cameraPerspective','cameraSide','cameraTop'])$(key).setAttribute('aria-pressed',String(key===id));}
    function requestFrame(){if(frameId===null&&isVisible&&!document.hidden)frameId=requestAnimationFrame(animate);}
    function resize(){const width=shell.clientWidth,height=shell.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();requestFrame();}
    function animate(stamp){
      frameId=null;if(!isVisible||document.hidden){lastStamp=0;return;}
      const dt=lastStamp?Math.min((stamp-lastStamp)/1000,.04):.016;lastStamp=stamp;if(!paused)elapsed+=dt;
      let cameraMoving=false;for(const key of ['yaw','pitch','distance']){const diff=desired[key]-position[key];if(Math.abs(diff)>.001){position[key]+=diff*(reduced.matches?1:.11);cameraMoving=true;}else position[key]=desired[key];}
      const {yaw,pitch,distance:d}=position;camera.position.set(Math.sin(yaw)*Math.cos(pitch)*d,1+Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d);camera.lookAt(0,1.15,-.7);
      if(ready&&!paused&&!cameraMoving&&!dragging&&stamp-lastRender<33){requestFrame();return;}lastRender=stamp;
      const time=elapsed;boat.position.y=.065+Math.sin(time*.75)*.018;boat.rotation.x=Math.sin(time*.53)*.008;boat.rotation.z=Math.sin(time*.46)*.006;
      canoe.position.y=.03+Math.sin(time*.81+1)*.015;
      const wa=waterGeo.attributes.position.array;for(let i=0;i<wa.length;i+=3)wa[i+1]=waterBase[i+1]+Math.sin(waterBase[i]*1.4+time*.85)*.023+Math.cos(waterBase[i+2]*2+waterBase[i]*.3-time*.48)*.017;waterGeo.attributes.position.needsUpdate=true;
      const fa=flag.geometry.attributes.position.array;for(let i=0;i<fa.length;i+=3)fa[i+2]=Math.sin(flagBase[i]*9-time*2)*.045*(flagBase[i]+.34)/.68;flag.geometry.attributes.position.needsUpdate=true;
      renderer.render(scene,camera);
      if(!ready){ready=true;fallback.hidden=true;canvas.dataset.renderer='webgl';canvas.dataset.camera='perspective';setPauseButton();}
      if(!paused||cameraMoving||dragging)requestFrame();
    }
    function preset(id,yaw,pitch){desired.yaw=yaw;desired.pitch=pitch;desired.distance=distance;cameraLabels(id);canvas.dataset.camera=id.replace('camera','').toLowerCase();requestFrame();}
    $('cameraPerspective').onclick=()=>preset('cameraPerspective',initial.yaw,initial.pitch);
    $('cameraSide').onclick=()=>preset('cameraSide',.05,.28);
    $('cameraTop').onclick=()=>preset('cameraTop',.15,1.16);
    $('sceneZoomIn').onclick=()=>{desired.distance=Math.max(12,desired.distance-2);canvas.dataset.zoom=desired.distance.toFixed(1);requestFrame();};
    $('sceneZoomOut').onclick=()=>{desired.distance=Math.min(27,desired.distance+2);canvas.dataset.zoom=desired.distance.toFixed(1);requestFrame();};
    $('scenePause').onclick=()=>{paused=!paused;setPauseButton();canvas.dataset.paused=String(paused);requestFrame();};
    $('sceneLight').onclick=()=>{sunset=!sunset;sun.color.set(sunset?0xffbd70:0xffebc1);sun.intensity=sunset?3.9:3.2;hemisphere.color.set(sunset?0xd6bd8c:0xe5e4ba);hemisphere.intensity=sunset?1.7:2.5;waterMat.color.set(sunset?0x58725c:0x416c5b);$('sceneLight').setAttribute('aria-pressed',String(sunset));canvas.dataset.light=sunset?'sunset':'day';requestFrame();};
    canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');requestFrame();});
    canvas.addEventListener('pointermove',e=>{if(!dragging)return;desired.yaw-=(e.clientX-lastX)*.006;desired.pitch=Math.max(.16,Math.min(1.25,desired.pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY;cameraLabels('');canvas.dataset.camera='custom';requestFrame();});
    function stopDrag(){dragging=false;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
    document.addEventListener('visibilitychange',()=>{lastStamp=0;requestFrame();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{isVisible=entries[0].isIntersecting;lastStamp=0;requestFrame();},{threshold:.01}).observe(shell);
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(shell);else window.addEventListener('resize',resize);
    reduced.addEventListener('change',e=>{if(e.matches){paused=true;setPauseButton();requestFrame();}});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.hidden=true;fallback.hidden=false;$('sceneHint').textContent='Cena ilustrativa · embarcação regional';});
    canvas.addEventListener('webglcontextrestored',()=>{canvas.hidden=false;fallback.hidden=true;requestFrame();});
    resize();requestFrame();
  }catch(error){
    canvas.hidden=true;fallback.hidden=false;$('sceneHint').textContent='Embarcação regional · ilustração';canvas.dataset.renderer='fallback';
    for(const id of ['cameraPerspective','cameraSide','cameraTop','sceneZoomIn','sceneZoomOut','scenePause','sceneLight'])$(id).disabled=true;
    console.warn('A cena 3D não está disponível neste navegador.',error.message);
  }
})();
