/**
 * External dependencies
 */
import HelloWorldPrimary from 'hello-world/main-primary';
import HelloWorldSecondary from 'hello-world/main-secondary';

/**
 * External dependencies
 */
import React from 'react';

export default {
	helloDemo( context, next ) {
		// Shouldn't this change the cache key?
		// calypso:server-render cache access for key +27s /hello-world
		// context.renderCacheKey = 'hello-test';

		context.primary = <HelloWorldPrimary />;

		// This could be set to `null` as well
		context.secondary = <HelloWorldSecondary />;

		next();
	},
};
