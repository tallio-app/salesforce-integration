'use strict';

const server = require('server');
server.extend(module.superModule);

server.append('Show', function(req, res, next) {
	const tallioEnabled = dw.system.Site.getCurrent().getCustomPreferenceValue("tallio_enabled");

	if(tallioEnabled && req.querystring.tallio) {
		const product = ProductFactory.get(params);
		const assets = require('*/cartridge/scripts/assets');
		assets.addJs('https://console.tallio.app/assets/pixel.js?product=' + product.id);
	}
	
	next();
});

module.exports = server.exports();