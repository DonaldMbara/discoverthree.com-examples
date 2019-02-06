function init() {

  const app = new THREE_APP( '#container' );

  app.init();

  app.scene.background = new THREE.Color( 0x8FBCD4 );
  app.camera.position.set( 3, 2, 15 );

  initLights( app.scene );

  const mesh = initMeshes( app.scene );

  const clips = initAnimation( mesh );

  setupExportControl( mesh, clips );

  app.start();

}

init();
