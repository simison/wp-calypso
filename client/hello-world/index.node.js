/**
 * External dependencies
 *
 * @format
 */

import config from 'config';

/**
 * Internal dependencies
 */
// import webRouter from './index.web';
import { helloDemo } from './controller';
import { makeLayout } from 'controller';

export default router => {
	if ( config.isEnabled( 'hello-world' ) ) {
		router( '/hello-world', helloDemo, makeLayout );
	}

	// webRouter( router );
};
