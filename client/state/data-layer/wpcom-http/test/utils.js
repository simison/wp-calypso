/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { getData, getError, getProgress, dispatchRequest, makeParser } from '../utils.js';

describe( 'WPCOM HTTP Data Layer', () => {
	const withData = data => ( { type: 'SLUGGER', meta: { dataLayer: { data } } } );
	const withError = error => ( { type: 'SLUGGER', meta: { dataLayer: { error } } } );
	const withProgress = progress => ( {
		type: 'UPLOAD_PROGRESS',
		meta: { dataLayer: { progress } },
	} );

	describe( '#getData', () => {
		test( 'should return successful response data if available', () => {
			const data = { utterance: 'Bork bork' };

			expect( getData( withData( data ) ) ).to.equal( data );
		} );

		test( 'should return undefined if no response data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getData( action ) ).to.be.undefined;
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getData( withData( '' ) ) ).to.equal( '' );
			expect( getData( withData( null ) ) ).to.equal( null );
			expect( getData( withData( 0 ) ) ).to.equal( 0 );
			expect( getData( withData( false ) ) ).to.equal( false );
		} );
	} );

	describe( '#getError', () => {
		test( 'should return failing error data if available', () => {
			const error = { utterance: 'Bork bork' };

			expect( getError( withError( error ) ) ).to.equal( error );
		} );

		test( 'should return undefined if no error data available', () => {
			const action = { type: 'SLUGGER' };

			expect( getError( action ) ).to.be.undefined;
		} );

		test( 'should return valid-but-falsey data', () => {
			expect( getError( withError( '' ) ) ).to.equal( '' );
			expect( getError( withError( null ) ) ).to.equal( null );
			expect( getError( withError( 0 ) ) ).to.equal( 0 );
			expect( getError( withError( false ) ) ).to.equal( false );
		} );
	} );

	describe( '#getProgress', () => {
		test( 'should return progress data if available', () => {
			const progress = { total: 1234, loaded: 123 };

			expect( getProgress( withProgress( progress ) ) ).to.equal( progress );
		} );
		test( 'should return valid-but-falsey data', () => {
			expect( getProgress( withProgress( '' ) ) ).to.equal( '' );
			expect( getProgress( withProgress( null ) ) ).to.equal( null );
			expect( getProgress( withProgress( 0 ) ) ).to.equal( 0 );
			expect( getProgress( withProgress( false ) ) ).to.equal( false );
		} );
	} );

	describe( '#dispatchRequest', () => {
		const initiator = () => ( { type: 'REQUEST' } );
		const onSuccess = ( action, data ) => ( { type: 'SUCCESS', data } );
		const onError = ( action, error ) => ( { type: 'FAILURE', error } );
		const onProgress = ( action, progress ) => ( { type: 'PROGRESS', progress } );

		const dispatcher = dispatchRequest( {
			initiator,
			onSuccess,
			onError,
			onProgress,
		} );

		const data = { count: 5 };
		const error = { message: 'oh no!' };
		const progress = { loaded: 45, total: 80 };

		const initiateHttpAction = { type: 'REFILL' };
		const successHttpAction = { type: 'REFILL', meta: { dataLayer: { data } } };
		const failureHttpAction = { type: 'REFILL', meta: { dataLayer: { error } } };
		const progressHttpAction = { type: 'REFILL', meta: { dataLayer: { progress } } };
		const bothHttpAction = { type: 'REFILL', meta: { dataLayer: { data, error } } };

		const successAction = { type: 'SUCCESS', data };
		const failureAction = { type: 'FAILURE', error };
		const progressAction = { type: 'PROGRESS', progress };

		let dispatch;
		let store;

		beforeEach( () => {
			dispatch = spy();
			store = { dispatch };
		} );

		test( 'should initiate request if meta information missing', () => {
			dispatcher( store, initiateHttpAction );
			expect( dispatch ).to.have.been.calledWith( {
				type: 'REQUEST',
				onSuccess: initiateHttpAction,
				onError: initiateHttpAction,
				onProgress: initiateHttpAction,
			} );
		} );

		test( 'should call onSuccess if meta includes response data', () => {
			dispatcher( store, successHttpAction );
			expect( dispatch ).to.have.been.calledWith( successAction );
		} );

		test( 'should call onError if meta includes error data', () => {
			dispatcher( store, failureHttpAction );
			expect( dispatch ).to.have.been.calledWith( failureAction );
		} );

		test( 'should call onError if meta includes both response data and error data', () => {
			dispatcher( store, bothHttpAction );
			expect( dispatch ).to.have.been.calledWith( failureAction );
		} );

		test( 'should call onProgress if meta includes progress data', () => {
			dispatcher( store, progressHttpAction );
			expect( dispatch ).to.have.been.calledWith( progressAction );
		} );

		test( 'should not throw runtime error if onProgress is not specified', () => {
			expect( () => {
				dispatchRequest( { initiator, onSuccess, onError } )( store, progressHttpAction );
			} ).to.not.throw( TypeError );
		} );

		test( 'should validate response data', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );
			dispatchRequest( { initiator, onSuccess, onError, fromApi } )( store, successHttpAction );
			expect( dispatch ).to.have.been.calledWith( successAction );
		} );

		test( 'should fail-over on invalid response data', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'string' } },
			} );
			dispatchRequest( { initiator, onSuccess, onError, fromApi } )( store, successHttpAction );
			expect( dispatch ).to.have.been.calledWithMatch( { type: 'FAILURE' } );
		} );

		test( 'should validate with additional fields', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequest( { initiator, onSuccess, onError, fromApi } )( store, action );
			expect( dispatch ).to.have.been.calledWithMatch( { type: 'SUCCESS' } );
		} );

		test( 'should filter out additional fields', () => {
			const fromApi = makeParser( {
				type: 'object',
				properties: { count: { type: 'integer' } },
			} );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequest( { initiator, onSuccess, onError, fromApi } )( store, action );
			expect( dispatch ).to.have.been.calledWith( { type: 'SUCCESS', data: { count: 15 } } );
		} );

		test( 'should transform validated output', () => {
			const schema = {
				type: 'object',
				properties: { count: { type: 'integer' } },
			};
			const transformer = ( { count } ) => ( { tribbleCount: count * 2, haveTrouble: true } );
			const fromApi = makeParser( schema, {}, transformer );

			const action = {
				type: 'REFILL',
				meta: { dataLayer: { data: { count: 15, is_active: true } } },
			};

			dispatchRequest( { initiator, onSuccess, onError, fromApi } )( store, action );

			expect( dispatch ).to.have.been.calledWith( {
				type: 'SUCCESS',
				data: {
					tribbleCount: 30,
					haveTrouble: true,
				},
			} );
		} );
	} );
} );
