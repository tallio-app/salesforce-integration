'use strict';

const server = require('server');
server.extend(module.superModule);

const OrderMgr = require('dw/order/OrderMgr');

server.append('Confirm', function(req, res, next) {
	const tallioEnabled = dw.system.Site.getCurrent().getCustomPreferenceValue("tallio_enabled");
	
	if(tallioEnabled) {
		const assets = require('*/cartridge/scripts/assets');

		const order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);

		let pixelObj = {
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
		
		if(order.customerNo) {
			pixelObj.userId = order.customerNo;
		}
		
		const lineItems = order.allProductLineItems;
		for(let i = 0; i < lineItems.length; i++) {
			const item = lineItems[i];
			
			if (item.product) {
			    pixelObj.items.push((item.product.variant) ? item.product.variationModel.master.ID : item.product.ID);
			}
		}

		assets.addJs('https://console.tallio.app/assets/pixel.js?order=' + order.orderNo + '&items=' + pixelObj.items.join(',') );
	}
	
	next();
});

module.exports = server.exports();