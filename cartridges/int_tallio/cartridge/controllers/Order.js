'use strict';

const server = require('server');
server.extend(module.superModule);

const OrderMgr = require('dw/order/OrderMgr');

server.append('Confirm', function(req, res, next) {
	var tallioEnabled = dw.system.Site.getCurrent().getCustomPreferenceValue("tallio_enabled");
	
	if(tallioEnabled) {
		const assets = require('*/cartridge/scripts/assets');


		const order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);
		
		const ProductFactory = require('*/cartridge/scripts/factories/product');
		const product = ProductFactory.get(req.querystring);

		const tallioTrackingService = require('int_tallio/cartridge/scripts/services/tallioService').initTrackingService();

		var requestData = {
			/* Optional parameters for the request */
			siteID: dw.system.Site.getCurrent().getID().toLowerCase(),
			tallioReference,
			orderId: order.orderNo,
			tax: order.totalTax.value,
			shipping: order.adjustedShippingTotalNetPrice.value,
			total: order.adjustedMerchandizeTotalPrice.value,
			city: order.billingAddress.city,
			state: order.billingAddress.stateCode,
			country: order.billingAddress.countryCode.value,
			currency: order.currencyCode,
			email: order.customerEmail,
			nickname: order.customerName,
			items: []
		};
	
		if (order.customerNo) {
			requestData.userId = order.customerNo;
		}
		
		var lineItems = order.allProductLineItems;
		for(var i = 0; i < lineItems.length; i++) {
			var item = lineItems[i];
			
			if (item.product) {
			    requestData.items.push((item.product.variant) ? item.product.variationModel.master.ID : item.product.ID);
			}
		}

		tallioTrackingService.setRequestMethod('POST');
		// Get the result of the HTTP request
		const result = tallioTrackingService.call(requestData);

	}
	
	next();
});


module.exports = server.exports();
