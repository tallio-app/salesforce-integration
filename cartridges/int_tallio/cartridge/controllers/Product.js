'use strict';

const server = require('server');
server.extend(module.superModule);


server.append('Show', function (req, res, next) {
	const tallioEnabled = dw.system.Site.getCurrent().getCustomPreferenceValue("tallio_enabled");

	const tallioReference = req.querystring.tallio;

	if (tallioEnabled && tallioReference) {

		const ProductFactory = require('*/cartridge/scripts/factories/product');
		const product = ProductFactory.get(req.querystring);

		const tallioTrackingService = require('int_tallio/cartridge/scripts/services/tallioService').initTrackingService();

		var requestData = {
			/* Optional parameters for the request */
			productID: product.id,
			siteID: dw.system.Site.getCurrent().getID().toLowerCase(),
			tallioReference,
		};
		tallioTrackingService.setRequestMethod('POST');
		// Get the result of the HTTP request
		const result = tallioTrackingService.call(requestData);
	}

	next();
});


module.exports = server.exports();
