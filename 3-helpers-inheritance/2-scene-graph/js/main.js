import {
  Color,
} from './vendor/three/three.module.js';

import App from './vendor/App.js';

import createLights from './lights.js';

import createGeometries from './geometries.js';
import createMaterials from './materials.js';
import createMeshes from './meshes.js';

import createHelpers from './helpers.js';

import setupAnimation from './animation.js';

async function initScene() {

  const app = new App( { container: '#scene-container' } );

  app.init();

  app.renderer.toneMappingExposure = 1;
  app.scene.background = new Color( 0x8FBCD4 );
  app.camera.position.set( -2, 1, 4 );

  app.start();

  const lights = createLights();

  const geometries = createGeometries();

  const materials = createMaterials();
  const meshes = createMeshes( geometries, materials );

  const helpers = createHelpers();

  setupAnimation( meshes );

  app.scene.add(

    lights.ambient,
    lights.main,

    // we'll add just the first mesh, but all of its children will be added too
    meshes.meshA,

    // axesHelper is your friend while you're
    // getting used to the coordinate system
    // green = y axis
    // red = x axis
    // blue = z axis
    // helpers.axesHelper,

  );

}

initScene();
