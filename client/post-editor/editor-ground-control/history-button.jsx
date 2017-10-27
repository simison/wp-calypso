/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { togglePostRevisionsPopover } from 'state/posts/revisions/actions';
import EditorRevisionsList from 'post-editor/editor-revisions-list';
import Popover from 'components/popover';

class HistoryButton extends PureComponent {
	toggleShowing = () => {
		this.props.togglePostRevisionsPopover();
		this.trackPopoverToggle();
	};

	trackPopoverToggle() {
		if ( this.props.popoverIsVisible ) {
			// don't track popover closes for now
			return;
		}

		this.props.recordTracksEvent( 'calypso_editor_post_revisions_open', {
			source: 'ground_control_history',
		} );
	}

	render() {
		const { loadRevision, selectRevision, selectedRevisionId } = this.props;
		return (
			<div className="editor-ground-control__history">
				<button
					className="editor-ground-control__save button is-link"
					onClick={ this.toggleShowing }
					ref="historyPopoverButton"
				>
					{ this.props.translate( 'History' ) }
				</button>
				<Popover
					isVisible={ this.props.popoverIsVisible }
					context={ this.refs && this.refs.historyPopoverButton }
				>
					<EditorRevisionsList
						loadRevision={ loadRevision }
						selectedRevisionId={ selectedRevisionId }
						selectRevision={ selectRevision }
					/>
					{ this.props.selectedRevisionId }
				</Popover>
			</div>
		);
	}
}

HistoryButton.PropTypes = {
	// connected state
	popoverIsVisible: PropTypes.bool,

	// connected actions
	togglePostRevisionsPopover,

	// localize
	translate: PropTypes.func,
};

const mapState = state => ( {
	popoverIsVisible: get( state, 'posts.revisions.ui.popoverIsVisible' ),
} );

const mapDispatch = dispatch => ( {
	recordTracksEvent,
	togglePostRevisionsPopover: () => dispatch( togglePostRevisionsPopover() ),
} );

export default flow( localize, connect( mapState, mapDispatch ) )( HistoryButton );
