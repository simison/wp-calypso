/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import SidebarRegion from './region';

export default class extends React.Component {
	static displayName = 'Sidebar';

	static propTypes = {
		className: PropTypes.string,
		onClick: PropTypes.func,
	};

	render() {
		const hasRegions = React.Children
			.toArray( this.props.children )
			.some( el => el.type === SidebarRegion );

		return (
			<ul
				className={ classNames( 'sidebar', this.props.className, { 'has-regions': hasRegions } ) }
				onClick={ this.props.onClick }
				data-tip-target="sidebar"
			>
				{ this.props.children }
			</ul>
		);
	}
}
