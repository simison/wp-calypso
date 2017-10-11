/**
 * External dependencies
 *
 * @format
 */

import schemaValidator from 'is-my-json-valid';
import { get, identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

/**
 * Returns response data from an HTTP request success action if available
 *
 * @param {Object} action may contain HTTP response data
 * @returns {?*} response data if available
 */
export const getData = action => get( action, 'meta.dataLayer.data', undefined );

/**
 * Returns error data from an HTTP request failure action if available
 *
 * @param {Object} action may contain HTTP response error data
 * @returns {?*} error data if available
 */
export const getError = action => get( action, 'meta.dataLayer.error', undefined );

/**
 * Returns (response) headers data from an HTTP request action if available
 *
 * @param {Object} action may contain HTTP response headers data
 * @returns {?*} headers data if available
 */
export const getHeaders = action => get( action, 'meta.dataLayer.headers', undefined );

/**
 * @typedef {Object} ProgressData
 * @property {number} loaded number of bytes already transferred
 * @property {number} total total number of bytes to transfer
 */

/**
 * Returns progress data from an HTTP request progress action if available
 *
 * @param {Object} action may contain HTTP progress data
 * @returns {Object|null} progress data if available
 * @returns {ProgressData}
 */
export const getProgress = action => get( action, 'meta.dataLayer.progress', undefined );

export class SchemaError extends Error {
	constructor( errors ) {
		super( 'Failed to validate with JSON schema' );
		this.schemaErrors = errors;
	}
}

export class TransformerError extends Error {
	constructor( error, data, transformer ) {
		super( error.message );
		this.inputData = data;
		this.transformer = transformer;
	}
}

export const makeParser = ( schema, schemaOptions = {}, transformer = identity ) => {
	const options = Object.assign( { verbose: true }, schemaOptions );
	const validator = schemaValidator( schema, options );

	// filter out unwanted properties even though we may have let them slip past validation
	// note: this property does not nest deeply into the data structure, that is, properties
	// of a property that aren't in the schema could still come through since only the top
	// level of properties are pruned
	const filter = schemaValidator.filter( { ...schema, additionalProperties: false } );

	const validate = data => {
		if ( ! validator( data ) ) {
			throw new SchemaError( validator.errors );
		}

		return filter( data );
	};

	const transform = data => {
		try {
			return transformer( data );
		} catch ( e ) {
			throw new TransformerError( e, data, transformer );
		}
	};

	// the actual parser
	return data => transform( validate( data ) );
};

/**
 * Dispatches to appropriate function based on HTTP request meta
 *
 * @see state/data-layer/wpcom-http/actions#fetch creates HTTP requests
 *
 * When the WPCOM HTTP data layer handles requests it will add
 * response data and errors to a meta property on the given success
 * error, and progress handling actions.
 *
 * This function accepts several functions as the initiator, success, error and
 * progress handlers for actions and it will call the appropriate
 * one based on the stored meta.
 *
 * These handlers are action creators: based on the input data coming from the HTTP request,
 * it will return an action (or an action thunk) to be executed as a response to the given
 * HTTP event.
 *
 * If both error and response data is available this will call the
 * error handler in preference over the success handler, but the
 * response data will also still be available through the action meta.
 *
 * The functions should conform to the following type signatures:
 *   initiator  :: Action -> Action (action creator with one Action parameter)
 *   onSuccess  :: Action -> ResponseData -> Action (action creator with two params)
 *   onError    :: Action -> ErrorData -> Action
 *   onProgress :: Action -> ProgressData -> Action
 *   fromApi    :: ResponseData -> TransformedData throws TransformerError|SchemaError
 *
 * @param {Function} initiator called if action lacks response meta; should create HTTP request
 * @param {Function} onSuccess called if the action meta includes response data
 * @param {Function} onError called if the action meta includes error data
 * @param {Function} onProgress called on progress events when uploading
 * @param {Function} fromApi maps between API data and Calypso data
 * @returns {Action} action or action thunk to be executed in response to HTTP event
 */
export const dispatchRequest = options => {
	if ( ! options.initiator ) {
		warn( 'initiator handler is not defined: no request will ever be issued' );
	}

	if ( ! options.onSuccess ) {
		warn( 'onSuccess handler is not defined: response to the request is being ignored' );
	}

	if ( ! options.onError ) {
		warn( 'onError handler is not defined: error during the request is being ignored' );
	}

	return ( store, action ) => {
		// create the low-level action we want to dispatch
		const requestAction = createRequestAction( options, action );
		// dispatch the low level action (if any was created) and return the result
		return requestAction ? store.dispatch( requestAction ) : undefined;
	};
};

/*
 * Converts an application-level Calypso action that's handled by the data-layer middleware
 * into a low-level action. For example, HTTP request that's being initiated, or a response
 * action with a `meta.dataLayer` property.
 */
function createRequestAction( options, action ) {
	const {
		initiator = noop,
		onSuccess = noop,
		onError = noop,
		onProgress = noop,
		fromApi = identity,
	} = options;

	const error = getError( action );
	if ( error ) {
		return onError( action, error );
	}

	const data = getData( action );
	if ( data ) {
		try {
			return onSuccess( action, fromApi( data ) );
		} catch ( err ) {
			return onError( action, err );
		}
	}

	const progress = getProgress( action );
	if ( progress ) {
		return onProgress( action, progress );
	}

	const initiatorAction = initiator( action );
	if ( ! initiatorAction ) {
		warn( "The `initiator` handler didn't return any action: no request will be issued" );
	}

	return Object.assign( {}, initiatorAction, {
		onSuccess: action,
		onError: action,
		onProgress: action,
	} );
}
