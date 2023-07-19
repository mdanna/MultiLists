define([], function() {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Controller Implementation")) || function() {};
    voltmxmp.logger.setLogLevel("TRACE");
    voltmxmp.logger.enableServerLogging = true;

    /**
     * @function ControllerImplementation.js
     * @private
     * @description: This is Factory module
     */
    var ControllerImplementation = function(componentInstance, componentName) {
        voltmxmp.logger.trace("----------Entering ControllerImplementation.js Function---------", voltmxmp.logger.FUNCTION_ENTRY);
        this.componentInstance = componentInstance;
        /**
         * @function getNativeController
         * @private
         * @description: This function will differentiate the platform specific module
         */
        this.getNativeController = function() {
            try {
                voltmxmp.logger.trace("----------Entering getNativeController Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                if (this.nativeControllerInstance === undefined) {
                    var deviceName = voltmx.os.deviceInfo().name;
                    var platformName = null;
                    if (deviceName.toLowerCase() === 'iphone' || deviceName.toLowerCase() === 'ipad') {
                        platformName = 'IOS.js';
                    } else if (deviceName.toLowerCase() === 'android') {
                        platformName = 'Android.js';
                    }
                    else if(deviceName.toLowerCase() === 'thinclient'){
                        platformName = 'DesktopWeb';	
                    }
                    var nativeControllerPath = 'com/voltmxmp/' + componentName + '/NativeController' + platformName;
                    var nativeController = require(nativeControllerPath);
                    this.nativeControllerInstance = new nativeController(this.componentInstance);
                }
                voltmxmp.logger.trace("----------Exiting getNativeController Function---------", voltmxmp.logger.FUNCTION_EXIT);
                return this.nativeControllerInstance;
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        };
        /**
         * @function speechToText
         * @private
         * @description: This function will invoke speech to text functionality in specific platform
         */
        this.speechToText = function() {
            try {
                voltmxmp.logger.trace("----------Entering speechToText Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                this.getNativeController().speechToText();
                voltmxmp.logger.trace("----------Exiting speechToText Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
         * @description: This function will stop the recognition of the specific platform
         */
        this.stopRecognition = function() {
            try {
                voltmxmp.logger.trace("----------Entering stopRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                this.getNativeController().stopRecognition();
                voltmxmp.logger.trace("----------Exiting stopRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        };
        this.requestPermission = function(){
            try {
                voltmxmp.logger.trace("----------Entering requestPermission Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                this.getNativeController().requestPermission();
                voltmxmp.logger.trace("----------Exiting requestPermission Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        };
        voltmxmp.logger.trace("----------Exiting ControllerImplementation.js Function---------", voltmxmp.logger.FUNCTION_EXIT);
    };

    return ControllerImplementation;
});