/**
 * External dependencies
 *
 * @format
 */

import { get, head, keyBy, merge, nth } from 'lodash';

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

			// @TODO use selector
			const _revisions = get( state, 'posts.revisions.revisions', [] );

			return {
				...state,
				basePostId: basePostId || head( _revisions ),
				siteId,
				postId: ( postId > basePostId && basePostId ) || nth( _revisions, 1 ),
			};
		}
		default:
			return state;
	}
}

// @TODO ensure no rehydration
export function ui( state = {}, action ) {
	switch ( action.type ) {
		case 'POST_REVISIONS_TOGGLE_POPOVER': {
			return {
				...state,
				popoverIsVisible: ! state.popoverIsVisible,
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
	ui,
} );
