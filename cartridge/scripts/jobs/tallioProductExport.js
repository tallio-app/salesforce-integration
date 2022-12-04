'use strict';

const Calendar = require('dw/util/Calendar');
const StringUtils = require('dw/util/StringUtils');
const ProductMgr = require('dw/catalog/ProductMgr');
const Site = require('dw/system/Site');
const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger').getLogger('Tallio', 'tallioProductExport.js');
const constants = require('int_tallio/cartridge/scripts/TallioConstants');

const XMLUtil = require('./util/XMLUtil');

var productIterator, productCount, xmlStreamWriter;
var processedItem = 0;

var currentType, openType;

function beforeStep(parameters, stepExecution) {
	Logger.debug('***** Before Step *****');
	
	productIterator = ProductMgr.queryAllSiteProducts();
	productCount = productIterator.count;

	var calendar = new Calendar();
	var timeStamp = StringUtils.formatCalendar(calendar, 'yyyyMMddhhmmss');
	var siteID = Site.current.ID;

	var path = constants.EXPORT.PATH; 
	var prefix = constants.EXPORT.PREFIX;
	var separator = constants.EXPORT.SEPARATOR; 

    var filename = prefix + separator + siteID + separator + timeStamp + '.xml'; 

    xmlStreamWriter = XMLUtil.getSW(filename, path);
	if(!xmlStreamWriter) {
		throw new Error('Stream Writer not initialized');
	}

	XMLUtil.startProductXML();
}

function getTotalCount(parameters, stepExecution) {
	Logger.debug('***** Get Total Count *****');

	var total = productCount;

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
		currentType = line.type;
		if(!openType) {
			XMLUtil.transition(false, currentType);
			openType = currentType;
		} else if(openType !== currentType) {
			XMLUtil.transition(true, currentType);
			openType = currentType;
		}

		XMLUtil.writeProductXML(line);
	});
}

function afterStep(success, parameters, stepExecution) {
	Logger.debug('***** After Step *****');

	if(openType) {
		XMLUtil.transition(true, null);
		openType = null;
	}

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