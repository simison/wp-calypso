/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { flow, head } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import EditorRevisionsList from 'post-editor/editor-revisions-list';
import Popover from 'components/popover';

class HistoryButton extends PureComponent {
	toggleShowing = () => {
		const { revisions, selectedRevision, selectRevision } = this.props;

		// otherwise, show revisions...
		this.trackPostRevisionsOpen();

		selectRevision( selectedRevision ? null : head( revisions ) || null );
	};

	trackPostRevisionsOpen() {
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
					isVisible={ this.props.showingRevisions }
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
	revisions: PropTypes.array,
	selectedRevision: PropTypes.func,
	selectRevision: PropTypes.func,
	showingRevisions: PropTypes.bool,
	translate: PropTypes.func,
};

export default flow( localize, connect( null, { recordTracksEvent } ) )( HistoryButton );
