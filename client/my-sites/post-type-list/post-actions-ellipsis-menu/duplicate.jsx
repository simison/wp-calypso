/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import QueryPostTypes from 'components/data/query-post-types';
import { canCurrentUser } from 'state/selectors';
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getCurrentUserId, isValidCapability } from 'state/current-user/selectors';
import { getEditorDuplicatePostPath } from 'state/ui/editor/selectors';
import { isEnabled } from 'config';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';

function PostActionsEllipsisMenuDuplicate( {
	translate,
	siteId,
	canEdit,
	duplicateUrl,
	isKnownType,
	bumpStat,
	status,
} ) {
	const validStatus = includes( [ 'draft', 'future', 'pending', 'private', 'publish' ], status );

	if ( ! isEnabled( 'posts/post-type-list' ) || ! canEdit || ! validStatus ) {
		return null;
	}

	return (
		<PopoverMenuItem href={ duplicateUrl } onClick={ bumpStat } icon="pages">
			{ siteId && ! isKnownType && <QueryPostTypes siteId={ siteId } /> }
			{ translate( 'Duplicate', { context: 'verb' } ) }
		</PopoverMenuItem>
	);
}

PostActionsEllipsisMenuDuplicate.propTypes = {
	globalId: PropTypes.string,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number,
	canEdit: PropTypes.bool,
	status: PropTypes.string,
	duplicateUrl: PropTypes.string,
	isKnownType: PropTypes.bool,
	bumpStat: PropTypes.func,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	const type = getPostType( state, post.site_ID, post.type );
	const userId = getCurrentUserId( state );
	const isAuthor = get( post.author, 'ID' ) === userId;

	let capability = isAuthor ? 'edit_posts' : 'edit_others_posts';
	const typeCapability = get( type, [ 'capabilities', capability ] );
	if ( isValidCapability( state, post.site_ID, typeCapability ) ) {
		capability = typeCapability;
	}

	return {
		status: post.status,
		siteId: post.site_ID,
		canEdit: canCurrentUser( state, post.site_ID, capability ),
		duplicateUrl: getEditorDuplicatePostPath( state, post.site_ID, post.ID ),
		isKnownType: !! type,
		type,
	};
};

const mapDispatchToProps = { bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type.name,
		'duplicate',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuDuplicate )
);
