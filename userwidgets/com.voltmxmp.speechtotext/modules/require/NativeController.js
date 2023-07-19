define([], function() {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Native Controller")) || function() {};
    voltmxmp.logger.setLogLevel("DEBUG");
    voltmxmp.logger.enableServerLogging = true;

    var NativeController = function(nativeController) {
        this.componentInstance = nativeController.componentInstance;
    };

    /**
     * @function speechToText
     * @private
     * @description: this function is called in the component constructor
     */
    NativeController.prototype.speechToText = function(context) {
        try {
            voltmxmp.logger.trace("----------Entering speechToText Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            throw {
                "type":"DEV",
                "Error": "Method doesn.t implemented",
                "message": "You have to implement the method speechToText!"
            };
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
     * @function stopRecognition
     * @private
     * @description: this function is called in the component constructor
     */
    NativeController.prototype.stopRecognition = function(context) {
        try {
            voltmxmp.logger.trace("----------Entering stopRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            throw {
                "type":"DEV",
                "Error": "Method doesn.t implemented",
                "message": "You have to implement the method stopRecognition!"
            };
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    return NativeController;
});