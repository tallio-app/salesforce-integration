'use strict';

const File = require('dw/io/File');
const Site = require('dw/system/Site');
const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger').getLogger('Tallio', 'tallioUpload.js');
const constants = require('int_tallio/cartridge/scripts/TallioConstants');

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
let sftpService;

function execute(parameters, stepExecution) {
	var enabled = parameters.Enabled;

	if(!enabled) {
		Logger.info('Upload step not enabled.');
		return;
	}

    try {
        const path = constants.EXPORT.PATH;
	    const prefix = constants.EXPORT.PREFIX;
	    const separator = constants.EXPORT.SEPARATOR;
		const remotePath = 'upload'; //@TODO move to constant
		
        const pattern = prefix + separator + Site.current.ID;
        
        const fileregex = new RegExp('^' + pattern + '_\\d{14}\\.xml$');
		const localPathFile = new File([File.TEMP, path].join(File.SEPARATOR));
		const localFiles = localPathFile.listFiles(function(f) {
			return fileregex.test(f.name);
		});

		// Start get sftp service
		const serviceID = "tallio.sftp.export." + Site.current.ID;

		sftpService = LocalServiceRegistry.createService(serviceID, {
			createRequest: function (service) {
				const args = Array.prototype.slice.call(arguments, 1);
				service.setOperation.apply(service, args);
				return service;
			},
			parseResponse: function (service, result) {
				return result;
			}
		});
		//end ge sftp service

		//start enter directory
		const targetDirectory = remotePath.charAt(0) === File.SEPARATOR ? remotePath.substring(1) : remotePath;

		Logger.info('target direcotry is:' + targetDirectory)

		const directoryExists = sftpService.call('cd', targetDirectory);

		// check if directory is ok
		if (!directoryExists.isOk()) {
			Logger.info('Directory does not exists, trying to create');
			
			sftpService.call('mkdir', targetDirectory);

			const createdDirectory = sftpService.call('cd', targetDirectory);
			
			if (!createdDirectory.isOk()) {
				throw new Error('Cannot create directory on target location')
			}
		}
		//end enter directory

		//Upload and delete local files
        for(let i = 0; i < localFiles.length; i++) {
        	const file = localFiles[i];
        	const result = uploadFile(remotePath + '/', file);

            if(!result.isOk()) {
            	Logger.error('Problem uploading file: ' + result.msg);
            	return new Status(Status.ERROR);
            } else {
            	file.remove();
            }
        }

    } catch (exception) {
        Logger.error('Exception: {0}', exception.message);
        return new Status(Status.ERROR);
    }
    finally {

    }

    return new Status(Status.OK)
}

function uploadFile(remoteFilePath, file) {

	const remotePathWithFile = remoteFilePath + file.getName();

	Logger.info('Uploading file {0} to {1}', file, remotePathWithFile);

	const result = sftpService.call('putBinary', remotePathWithFile, file);

	const uploadResult = result.getObject();

	if (!result.isOk() || !uploadResult) {
		throw new Error('SFTP upload not successfull :' + file.getFullPath() + ' error: ' + result.getErrorMessage());
	}

	Logger.info('File {0} uploaded successfully.', remotePathWithFile)

	return result;
}

module.exports.execute = execute;