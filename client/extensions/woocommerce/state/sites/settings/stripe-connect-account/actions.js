/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT,
} from 'woocommerce/state/action-types';

export function createAccount( siteId, email, countryCode ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
		countryCode,
		email,
		siteId,
	};
}

export function disconnectAccount( siteId ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DISCONNECT,
		siteId,
	};
}

export function fetchAccountDetails( siteId ) {
	return {
		type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
		siteId,
	};
}
