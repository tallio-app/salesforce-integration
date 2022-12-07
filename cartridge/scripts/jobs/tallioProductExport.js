'use strict';

const Calendar = require('dw/util/Calendar');
const StringUtils = require('dw/util/StringUtils');
const ProductMgr = require('dw/catalog/ProductMgr');
const Site = require('dw/system/Site');
const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger').getLogger('Tallio', 'tallioProductExport.js');
const constants = require('int_tallio/cartridge/scripts/TallioConstants');

const XMLUtil = require('./util/XMLUtil');

let productIterator, productCount, xmlStreamWriter;
let processedItem = 0;

function beforeStep(parameters, stepExecution) {
	Logger.debug('***** Before Step *****');
	
	productIterator = ProductMgr.queryAllSiteProducts();
	productCount = productIterator.count;

	const calendar = new Calendar();
	const timeStamp = StringUtils.formatCalendar(calendar, 'yyyyMMddhhmmss');
	const siteID = Site.current.ID;

	const path = constants.EXPORT.PATH; 
	const prefix = constants.EXPORT.PREFIX;
	const separator = constants.EXPORT.SEPARATOR; 

    const filename = prefix + separator + siteID + separator + timeStamp + '.xml'; 

    xmlStreamWriter = XMLUtil.getSW(filename, path);
	if(!xmlStreamWriter) {
		throw new Error('Stream Writer not initialized');
	}

	XMLUtil.startProductXML();
}

function getTotalCount(parameters, stepExecution) {
	Logger.debug('***** Get Total Count *****');

	const total = productCount;

	Logger.debug('Total Count: ' + total);
	return total
}

function read(parameters, stepExecution) {
	Logger.debug('***** Read *****');

	if (productIterator.hasNext()) {
		return {type: 'Products', obj: productIterator.next()}
	}
}

function process(item, parameters, stepExecution) {
	Logger.debug('***** Process *****');
	return item;
}

function write(lines, parameters, stepExecution) {
	Logger.debug('***** Write *****');
	
	[].forEach.call(lines, function (line) {
		XMLUtil.writeProductXML(line);
	});
}

function afterStep(success, parameters, stepExecution) {
	Logger.debug('***** After Step *****');

	XMLUtil.endProductXML()
	productIterator.close();
}

module.exports = {
    beforeStep: beforeStep,
    getTotalCount: getTotalCount,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};