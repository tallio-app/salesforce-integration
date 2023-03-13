'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Logger = require('dw/system/Logger').getLogger('Tallio', 'tallioService.js');
const constants = require('int_tallio/cartridge/scripts/TallioConstants');

function uploadProducts(catalogId, products) {
    
    var service = LocalServiceRegistry.createService('tallio.catalog', {});
    var params = {
        method: 'GET',
        path: constants.PRODUCT_UPLOAD,//constants.PRODUCT_UPLOAD 
        headers: {
            'Content-Type': 'application/json',
            'Access-Token': 'dasdasdasd'
        },
        body: {
            catalog_id: catalogId,
            products: products
        }
    };
    var result = service.call(params);
    Logger.info('Number of products sent ' + products.length);

    // if (!result.ok && result.error == '307') {
    //     // var serviceRetry = serviceHelper.getService(constants.SERVICES.BASE);   
    //     // var responseRetry = serviceRetry.call(params);
    //     // response = parseResponse(responseRetry, 'upload.products.call');
    // }
    return response;
}


function getTrackingService() {

    return LocalServiceRegistry.createService('tallio.https', {
        createRequest: function (svc: HTTPService, args) {
            // Prepare the http service

            // const user = svc.getConfiguration().getCredential().getUser();
            const apiKey = svc.getConfiguration().getCredential().getPassword();
            svc.addHeader('Authorization', apiKey);
            svc.addHeader('User-Agent', 'your_authorization_header');
            svc.addHeader('Content-Type', 'application/json;charset=UTF-8');

            if (svc.getRequestMethod() === 'POST' && args) {
                return JSON.stringify(args);
            }
            return svc
        },

        parseResponse: function (svc, resp) {
            return JSON.stringify(resp.text);
        },
    });
}

function initTrackingService() {
    var trackingService = getTrackingService();
    trackingService.setRequestMethod('POST');
    //trackingService.setURL(trackingService.getURL() + '/endpoint/product');
    return trackingService;
}

module.exports = {
    uploadProducts: uploadProducts,
    initTrackingService: initTrackingService
};
