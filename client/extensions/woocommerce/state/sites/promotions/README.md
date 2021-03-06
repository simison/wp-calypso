Promotions
==========

Promotions are a synthetic state construct that are actually created from one of two API objects: coupons, or products (with sale prices). Due to this, a promotion can have one of the following types:

* `product_sale` (for a product with a sale price)
* `percent` (coupon, matches coupon type)
* `fixed_cart` (coupon, matches coupon type)
* `fixed_product` (coupon, matches coupon type)

## Promotions Object

As Promotions only exist in memory state on the client at this point, the definition of a promotion is as follows:

```js
{
	// Required properties
	id: string,                // Generated unique id of promotion (not persistent).
	name: string,              // Name generated by API data for display purposes.
	type: string               // one of the types above.
	appliesTo: object,         // Complex selection object described below.

	// Amount properties (optional)
	fixedDiscount: number,     // Discount in currency amount.
	percentDiscount: number,   // Percent off (only used for cart discount).
	salePrice: number,         // Specified sale price (for product sales).

	// Additional options (optional)
	freeShipping: boolean,     // Allows free shipping with this coupon.

	// Constraint properties (optional)
	couponCode: string,        // Coupon code for those promotions which require it.
	startDate: date,           // Sale start date or coupon creation date.
	endDate: date,             // Coupon expiration or sale end date.
	individualUse: boolean,    // Just like in coupons, can not be used with another coupon.
	usageLimit: number,        // Total number of times this coupon can be used.
	usageLimitPerUser: number, // Number of times this coupon can be used by each user.
	minimumAmount: number,     // Minimum spend to qualify for this promotion.
	maximumAmount: number,     // Maximum spend allowed to benefit from this promotion.
}
```

### appliesTo

The `appliesTo` object for a promotion is a complex object which describes what all the promotion can be applied to. At this point, exluded products or categories are not supported.

#### Example: all products.
```js
{
	appliesTo: {
		all: true,
	}
}
```

#### Example: specific products.
```js
{
	appliesTo: {
		productIds: [ 10, 11, 12, 242, 244 ],
	}
}
```

### Example: products by category.
```js
{
	appliesTo: {
		productCategoryIds: [ 180, 181 ]
	}
}
```

## Actions

### `fetchPromotions( siteId: number, perPage: number, optional )`

**Note: Triggers a fetch of all products and coupons.**

In order to compile the sorted list of promotions, it's necessary to fetch all products and coupons because they cannot be fetched and paginated by end date. In the future, when API support is better, it may be possible to paginate this list.


## Reducer

A combined object of promotion objects and the API data needed to fulfill them.

As products and coupons are fetched, they are placed here. After both of those arrays are complete, the promotions array is populated. Until then, promotions will be a falsy value and should be depicted with placeholder UI elements.

```js
{
	promotions: [] or null,
	products: [] or null,
	coupons: [] or null,
}
```

## Helpers

There are several helper functions to handle the complexity of promotion objects:

### `createPromotionFromProduct( product: object )`

Creates a promotion object from a product which is on sale.

### `createPromotionFromCoupon( coupon: object )`

Creates a promotion object from a coupon.

### `isCategoryExplicitlySelected( promotion: object, category: object )`

Tests if a category is specified in the `appliesTo` property of a promotion.

### `isProductExplicitlySelected( promotion: object, product: object )`

Tests if a product is specified in the `appliesTo` property of a promotion.

### `isCategorySelected( promotion: object, category: object )`

Tests if a category explicitly selected, or implicitly via `all`.

### `isProductSelected( promotion: object, product: object )`

Tests if a product explicitly selected, or implicitly via a category or `all`.

