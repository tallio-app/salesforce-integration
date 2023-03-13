'use strict';

const StringUtils = require('dw/util/StringUtils');
const File = require('dw/io/File');
const FileWriter = require('dw/io/FileWriter');
const URLUtils = require('dw/web/URLUtils');
const XMLStreamWriter = require('dw/io/XMLIndentingStreamWriter');

var _file,
	_writer,
	_fileWriter,
	_streamWriter;

function getSW(fileName, localPath) {
	if(_streamWriter) {
		Logger.debug('Returning already initialized stream writer');
		return true;
	}
	
	if(!fileName) {
		Logger.error('No Filename provided');
		return false;
	}
	
	var filePath = [File.TEMP, localPath].join(File.SEPARATOR);
	var filePathFile = new File(filePath);
	filePathFile.mkdirs(); // create directories if missing
	_file = new File(filePathFile, fileName);
	_fileWriter = new FileWriter(_file);
	_streamWriter = new XMLStreamWriter(_fileWriter);
	
	return true;
}

function startProductXML() {
	_streamWriter.writeStartDocument('UTF-8', '1.0');
	_streamWriter.writeCharacters('\n');
	_streamWriter.writeStartElement('Products');
	//@TODO add additional attributes

	_streamWriter.writeAttribute('name', 'Tallio');
	_streamWriter.writeAttribute('generator', 'Salesforce Commerce Cloud (Demandware) Tallio Cartridge ');
}

function endProductXML() {
	_streamWriter.writeEndElement(); //Products
	_streamWriter.writeEndDocument();

	_streamWriter.flush();
	_streamWriter.close();
	
	_streamWriter = null;
}

function writeProductXML(item) {
	var product = item.obj;


	if(product.online && product.searchable) {
		_streamWriter.writeStartElement('Product');
		writeElement('ID', product.ID.replace('&', '_and_', 'g').replace('/', '_fslash_', 'g'));

		writeElement('Name', product.name);

		if (product.variant) {

			const variationModel = product.variationModel;

			writeElement('MasterProduct', variationModel.master.ID);
			

			const collections = require('*/cartridge/scripts/util/collections');

			const productAttributes = variationModel.getProductVariationAttributes();

			collections.forEach(productAttributes, function (productVariationAttribute) {
				const productVariationAttributeValue = variationModel.getSelectedValue(productVariationAttribute);
				writeAttributeElement('VariationData', productVariationAttributeValue.displayValue, 'name', productVariationAttribute.displayName);
			});
		}

		writeElementCDATA('Description', (product.shortDescription == null ? '' : product.shortDescription));

		writeElement('ProductPageUrl', URLUtils.https('Product-Show','pid',product.ID));

		var productImage = product.getImage('large').getHttpsURL();

		if (!empty(productImage)) {
			writeElement('ImageUrl', productImage);
		}

		var pricingModel = product.getPriceModel();

		writeElement('MinPrice', pricingModel.getMinPrice().toFormattedString())
		writeElement('MaxPrice', pricingModel.getMaxPrice().toFormattedString())

		_streamWriter.writeEndElement(); //Product
	}
}

function writeAttributeElement(XMLElement, content, name, value) {
	_streamWriter.writeStartElement(XMLElement);
	_streamWriter.writeAttribute(name, value);
	_streamWriter.writeCharacters(content);
	_streamWriter.writeEndElement();
}

function writeElement(XMLElement, value) {
	_streamWriter.writeStartElement(XMLElement);
	_streamWriter.writeCharacters(value);
	_streamWriter.writeEndElement();
}

function writeElementCDATA(XMLElement, CDATA) {
	_streamWriter.writeStartElement(XMLElement);
	_streamWriter.writeCData(CDATA);
	_streamWriter.writeEndElement();
}

function transition(endNode, startNode) {
	if(endNode) {
		_streamWriter.writeEndElement();
	}
	
	if(startNode) {
		_streamWriter.writeStartElement(startNode);
	}
}

module.exports = {
	getSW           : getSW,
	startProductXML : startProductXML,
	endProductXML   : endProductXML,
	writeProductXML : writeProductXML,
	transition      : transition
};