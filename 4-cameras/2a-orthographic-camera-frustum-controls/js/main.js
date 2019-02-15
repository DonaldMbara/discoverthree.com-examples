import {
  Color,
} from './vendor/three/three.module.js';

import App from './vendor/App.js';

import createLights from './lights.js';

import createGeometries from './geometries.js';
import createMaterials from './materials.js';
import createMeshes from './meshes.js';

import setupCamera from './cameras.js';

import setupControls from './interactivity.js';

import setupOnResize from './resize.js';

async function initScene() {

  const app = new App( { container: '#scene-container' } );

  // remember to create the custom camera before calling app.init!
  setupCamera( app );

  app.init();

  app.renderer.toneMappingExposure = 0.5;
  app.scene.background = new Color( 0x23485c );
  app.controls.target.y = 1;

  setupOnResize( app );

  app.start();

  const lights = createLights();

  const geometries = createGeometries();
  const materials = createMaterials();

  const meshes = createMeshes( geometries, materials );

  setupControls( app );

  app.scene.add(

    lights.ambient,
    lights.main,

    ...meshes.spheresArray,

  );

}

initScene();
