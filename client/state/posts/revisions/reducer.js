/**
 * External dependencies
 *
 * @format
 */

import { keyBy, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducers } from 'state/utils';

export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_REVISIONS_REQUEST:
		case POST_REVISIONS_REQUEST_FAILURE:
		case POST_REVISIONS_REQUEST_SUCCESS:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId ]: action.type === POST_REVISIONS_REQUEST,
				},
			} );
	}

	return state;
}

export function revisions( state = {}, action ) {
	if ( action.type === POST_REVISIONS_RECEIVE ) {
		const { siteId, postId } = action;
		return {
			...state,
			[ siteId ]: {
				...state[ siteId ],
				[ postId ]: keyBy( action.revisions, 'id' ),
			},
		};
	}

	return state;
}

// @TODO ensure no rehydration
export function selection( state = {}, action ) {
	switch ( action.type ) {
		case 'POST_REVISIONS_SELECT': {
			const { basePostId, siteId, postId } = action;
			return {
				...state,
				basePostId,
				siteId,
				postId,
			};
		}
		case 'POST_REVISIONS_TOGGLE_VISIBILITY': {
			return {
				...state,
				showing: ! state.showing,
			};
		}
		default:
			return state;
	}
}

export default combineReducers( {
	requesting,
	revisions,
	selection,
} );
