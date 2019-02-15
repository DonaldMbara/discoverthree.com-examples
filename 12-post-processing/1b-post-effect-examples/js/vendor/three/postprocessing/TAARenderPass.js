

import {
	WebGLRenderTarget,
} from '../three.module.js';

import { SSAARenderPass } from './SSAARenderPass.js'

var TAARenderPass = function ( scene, camera, params ) {

	if ( SSAARenderPass === undefined ) {

		console.error( "TAARenderPass relies on SSAARenderPass" );

	}

	SSAARenderPass.call( this, scene, camera, params );

	this.sampleLevel = 0;
	this.accumulate = false;

};

TAARenderPass.JitterVectors = SSAARenderPass.JitterVectors;

TAARenderPass.prototype = Object.assign( Object.create( SSAARenderPass.prototype ), {

	constructor: TAARenderPass,

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( ! this.accumulate ) {

			SSAARenderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta );

			this.accumulateIndex = - 1;
			return;

		}

		var jitterOffsets = TAARenderPass.JitterVectors[ 5 ];

		if ( ! this.sampleRenderTarget ) {

			this.sampleRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );
			this.sampleRenderTarget.texture.name = "TAARenderPass.sample";

		}

		if ( ! this.holdRenderTarget ) {

			this.holdRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, this.params );
			this.holdRenderTarget.texture.name = "TAARenderPass.hold";

		}

		if ( this.accumulate && this.accumulateIndex === - 1 ) {

			SSAARenderPass.prototype.render.call( this, renderer, this.holdRenderTarget, readBuffer, delta );

			this.accumulateIndex = 0;

		}

		var autoClear = renderer.autoClear;
		renderer.autoClear = false;

		var sampleWeight = 1.0 / ( jitterOffsets.length );

		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ "opacity" ].value = sampleWeight;
			this.copyUniforms[ "tDiffuse" ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
			var numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( var i = 0; i < numSamplesPerFrame; i ++ ) {

				var j = this.accumulateIndex;
				var jitterOffset = jitterOffsets[ j ];

				if ( this.camera.setViewOffset ) {

					this.camera.setViewOffset( readBuffer.width, readBuffer.height,
						jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625,   // 0.0625 = 1 / 16
						readBuffer.width, readBuffer.height );

				}

				renderer.render( this.scene, this.camera, writeBuffer, true );
				renderer.render( this.scene2, this.camera2, this.sampleRenderTarget, ( this.accumulateIndex === 0 ) );

				this.accumulateIndex ++;

				if ( this.accumulateIndex >= jitterOffsets.length ) break;

			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		var accumulationWeight = this.accumulateIndex * sampleWeight;

		if ( accumulationWeight > 0 ) {

			this.copyUniforms[ "opacity" ].value = 1.0;
			this.copyUniforms[ "tDiffuse" ].value = this.sampleRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, true );

		}

		if ( accumulationWeight < 1.0 ) {

			this.copyUniforms[ "opacity" ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ "tDiffuse" ].value = this.holdRenderTarget.texture;
			renderer.render( this.scene2, this.camera2, writeBuffer, ( accumulationWeight === 0 ) );

		}

		renderer.autoClear = autoClear;

	}

} );

export { TAARenderPass }
