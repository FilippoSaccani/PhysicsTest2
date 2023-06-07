import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls";
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';

let scene, renderer, camera, world, controls;
let meshes = [];
let bodies = [];

let cubeSize = 20;
let cubeHeight = 500;

function update() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}
function initThree(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.add(new THREE.AxesHelper(1000))


    //telecamera
    camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2);
    camera.position.set(0, 0, 1000);
    camera.lookAt(0, 0, 0);
    camera.near = 0;
    camera.far = 5000;


    //renderizzatore
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;


    //luce ambientale
    const hemiLight = new THREE.HemisphereLight();
    hemiLight.intensity = 0.3;
    scene.add(hemiLight);


    //spotlight
    const spotLight = new THREE.SpotLight();
    spotLight.intensity = 10;
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 3000;
    spotLight.shadow.mapSize.width = 2056;
    spotLight.shadow.mapSize.height = 2056;
    spotLight.shadow.bias = 0.0000001;

    spotLight.position.set(800, 600, 0);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add(spotLightHelper);


    //pavimento
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 1000, 1000 ),
        new THREE.MeshLambertMaterial( { color: 0xf0f0f0 } )
    );
    plane.receiveShadow = true;
    plane.geometry.rotateX(-Math.PI / 2);
    scene.add(plane);

    //cubo
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSize, cubeHeight, cubeSize),
        new THREE.MeshStandardMaterial({color: 0xff0000})
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    meshes.push(cube);


    //controlli
    controls = new OrbitControls( camera, renderer.domElement );

    window.onresize = update;
}

function initCannon(){
    //fisica
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    });

    const baseMaterial = new CANNON.Material();

    //pavimento
    const planeBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        material: baseMaterial
    });
    planeBody.position.set(0, 0, 0);
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(planeBody);


    //cubo
    const cubeBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(cubeSize/2, cubeHeight/2, cubeSize/2)),
        material: baseMaterial
    });
    cubeBody.position.set(0, 500, 300);
    world.addBody(cubeBody);
    bodies.push(cubeBody);

    const base_base = new CANNON.ContactMaterial(baseMaterial, baseMaterial, {
        restitution: 1
    });
    world.addContactMaterial(base_base);
}

function animate() {
    requestAnimationFrame( animate );

    world.fixedStep();

    for (let i = 0; i !== meshes.length; i++) {
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
    }

    controls.update();

    renderer.render( scene, camera );
}

initThree();
initCannon();
animate();