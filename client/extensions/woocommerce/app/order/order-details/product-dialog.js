/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProductSearch from 'woocommerce/components/product-search';

class OrderFeeDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		editOrder: PropTypes.func.isRequired,
		order: PropTypes.shape( {
			id: PropTypes.number.isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		products: [],
	};

	componentWillUpdate( nextProps ) {
		// Dialog is being closed, clear the state
		if ( this.props.isVisible && ! nextProps.isVisible ) {
			this.setState( {
				products: [],
			} );
		}
	}

	handleChange = products => {
		this.setState( {
			products: products.map( item => ( {
				product_id: item.id,
				name: item.name,
				sku: item.sku,
				price: item.price,
				total: item.price,
				quantity: 1,
			} ) ),
		} );
	};

	handleProductSave = () => {
		const { siteId, order } = this.props;
		if ( siteId ) {
			const products = this.state.products.map( item => ( {
				...item,
				id: uniqueId( 'product_' ),
			} ) );
			const lineItems = order.line_items || [];

			this.props.editOrder( siteId, {
				id: order.id,
				line_items: [ ...lineItems, ...products ],
			} );
		}
		this.props.closeDialog();
	};

	render() {
		const { closeDialog, isVisible, translate } = this.props;
		const dialogClass = 'woocommerce order-details__dialog'; // eslint/css specificity hack

		const dialogButtons = [
			<Button onClick={ closeDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleProductSave } disabled={ ! this.state.products.length }>
				{ translate( 'Add Product' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ closeDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
				additionalClassNames="order-payment__dialog woocommerce"
			>
				<h1>{ translate( 'Add a product' ) }</h1>
				<p>
					{ translate(
						'Add products by searching for them. You can change the quantity after adding them.'
					) }
				</p>
				<ProductSearch onChange={ this.handleChange } />
			</Dialog>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const order = getOrderWithEdits( state );

		return {
			siteId,
			order,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderFeeDialog ) );
