/**
 * Created by Team voltmx.
 * Copyright (c) 2017 voltmx Inc. All rights reserved.
 */
define(['./ControllerImplementation'],function(ControllerImplementation) {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Speech To Text Controller")) || function() {};
    voltmxmp.logger.setLogLevel("TRACE");
    var constants = constants || {};
    constants.DEFAULT_ANDROID_PERMISSION_ERROR = "Please grant the microphone permissions in device settings";
    constants.DEFAULT_IOS_PERMISSION_ERROR = "Please ensure permissions for both Speech recognition & Microphone are granted in device settings";
    var platform = voltmx.os.deviceInfo().name.toLowerCase();

    return {
        /**
         * @function constructor
         * @private
         * @params {Object} baseConfig, layoutConfig, pspConfig
         */
        constructor: function(baseConfig, layoutConfig, pspConfig) {
            voltmxmp.logger.trace("----------Entering constructor---------", voltmxmp.logger.FUNCTION_ENTRY);
            this._centerYSet = "";
            this._centerXSet = "";
            this.voltmxDeviceInfo = voltmx.os.deviceInfo();
            this._screenHeight = this.voltmxDeviceInfo.screenHeight;
            this._screenWidth = this.voltmxDeviceInfo.screenWidth;
            this.view.doLayout = this.setFrameValues;
            this._packageName = "";
            this._frameWidth = "0";
            this._isAudioCreated = false;
            this._isValidLanguage = false;
            this.recognizer = null;
            this._bufferSize = 1024;
            this._avAudioBus = 0;
            this._androidLanguage = "en-US";
            this._iosLanguage = "en-US";
            this._packageValidation = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_](\.[a-z0-9_]+)+[0-9a-z_*]$/;
            this.controllerImpl=new ControllerImplementation(this,baseConfig.id);
            this.controllerImpl.requestPermission();
            voltmxmp.logger.trace("----------Exiting constructor ---------", voltmxmp.logger.FUNCTION_EXIT);
        },
        /**
         * @function initGetterSetters
         * @private
         * @description: Logic for getters/setters of custom properties
         */
        initGettersSetters: function() {
            voltmxmp.logger.trace("----------Entering initGettersSetters Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            defineGetter(this, "packageName", function() {
                return this._packageName;
            });
            defineSetter(this, "packageName", function(val) {
                try {
                    if (this._packageValidation.test(val) && this._packageName !== null) {
                        this._packageName = val;
                    } else {
                        throw {
                            "type":"CUSTOM",
                            "Error": "invalidpackagename",
                            "message": "the package name should be xxx.xxx.xxx"
                        };
                    }
                } catch (exception) {
                    voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                    if(exception.type === "CUSTOM"){
                        throw exception;
                    }
                }
            });
            defineGetter(this, "setAndroidLanguage", function() {
                return this._androidLanguage;
            });
            defineSetter(this, "setAndroidLanguage", function(val) {
                this._androidLanguage = val;
            });
            defineGetter(this, "setIphoneLanguage", function() {
                return this._iosLanguage;
            });
            defineSetter(this, "setIphoneLanguage", function(val) {
                this._iosLanguage = val;
            });
            defineGetter(this, "setWebLanguage", function() {
                return this._webLanguage;
            });
            defineSetter(this, "setWebLanguage", function(val) {
                this._webLanguage = val;
            });
            voltmxmp.logger.trace("----------Exiting initGettersSetters Function---------", voltmxmp.logger.FUNCTION_EXIT);
        },
        /**
         * @function setFrameValues
         * @private
         * @description: stores the frame values
         */
        setFrameValues: function() {
            voltmxmp.logger.trace("----------Entering setFrameValues Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            try {
                if (this.view.width !== "100%" && this._frameWidth.toString() === "0") {
                    this._frameLeft = parseFloat(this.view.frame.x);
                    this._frameWidth = parseFloat(this.view.frame.width);
                }
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            }
            voltmxmp.logger.trace("----------Exiting setFrameValues Function---------", voltmxmp.logger.FUNCTION_EXIT);
        },
        /**
         * @function speech
         * @private
         * @description: The first call where device detection is done 
         */
        speech: function() {
            voltmxmp.logger.trace("----------Entering speech Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            try {
                if (this._centerXSet === "") {
                    this._centerXSet = ((this._frameLeft + (this._frameWidth / 2)) / this._screenWidth) * 100;
                }
                this._text = "";
                this.view.width = "100%";
                this.view.centerX = "50%";
                if (this.checkPermission()){
                    this.view.flxMicrophone.isVisible = false;
                    this.view.forceLayout();
                    this.controllerImpl.speechToText();
                }
                voltmxmp.logger.trace("----------Exiting speech Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }

        },
        /**
         * @function stop
         * @private
         * @description: This function stops recognition engines of individual platforms
         */
        stop: function() {
            try {
                voltmxmp.logger.trace("----------Entering stop Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                this.controllerImpl.stopRecognition();
                this.resetUI();
                voltmxmp.logger.trace("----------Exiting stop Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },
        /**
         * @function resetUI
         * @private
         * @description: This function resetUI will reset the UI back initial state
         */
        resetUI: function() {
            try {
                voltmxmp.logger.trace("----------Entering resetUI Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                this.view.imgGif.isVisible = false;
                this.view.flxMicrophone.isVisible = true;
                this.view.flxAnim.isVisible = false;            
                this.view.centerX = this._centerXSet + "%";
                this.view.width = ((this._frameWidth / this._screenWidth) * 100) + "%";
                this.view.forceLayout();
                voltmxmp.logger.trace("----------Exiting resetUI Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },
        /**
         * @function invokeCallback
         * @private
         * @description: This function will invoke speechCallback event
         */
        invokeCallback: function(text) {
            try {
                voltmxmp.logger.trace("----------Entering invokeCallback Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                if (this.speechCallback !== undefined && this.speechCallback !== null && typeof this.speechCallback === 'function') {
                    this.speechCallback(text);
                }
                voltmxmp.logger.trace("----------Exiting invokeCallback Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },
        /**
         * @function onSpeechClick
         * @private
         * @description: This function is used to invoke speech function
         */
        onSpeechClick: function() {
            try {
                voltmxmp.logger.trace("----------Entering onSpeechClick Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                if (this.onMicClick !== undefined && this.onMicClick !== null && typeof this.onMicClick === 'function') {
                    this.onMicClick();
                }
                this.speech();
                voltmxmp.logger.trace("----------Exiting onSpeechClick Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },
        /**
         * @function onSpeechCancel
         * @private
         * @description: This function is used to call stop function
         */
        onSpeechCancel: function() {
            try {
                voltmxmp.logger.trace("----------Entering onSpeechCancel Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                if (this.onCancelClick !== undefined && this.onCancelClick !== null && typeof this.onSpeechCancel === 'function') {
                    this.onCancelClick();
                }
                this.stop();
                voltmxmp.logger.trace("----------Exiting onSpeechCancel Function---------", voltmxmp.logger.FUNCTION_EXIT);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },
        /**
         * @function checkPermission
         * @private
         * @description: This function is used to check microphone permission
         */
        checkPermission: function() {
            try {
                voltmxmp.logger.trace("----------Entering checkPermission Function---------", voltmxmp.logger.FUNCTION_ENTRY);
                var permissionRequest = "";
                var option = {isAccessModeAlways:true};
                if (platform === "android") {
                    permissionRequest = "android.permission.RECORD_AUDIO";
                } else if (platform === "iphone" || platform === "ipad") {
                    permissionRequest = voltmx.os.RESOURCE_AUDIO_RECORD;
                } else if (platform === "thinclient") {
                    //voltmx.os.RESOURCE_AUDIO_RECORD is undefined on PWA
                    return true;
                }
                var result = voltmx.application.checkPermission(permissionRequest);
                if (result.status === voltmx.application.PERMISSION_GRANTED) {
                    return true;
                } else if ( result.status === voltmx.application.PERMISSION_DENIED || result.status === 0) {  
                    voltmx.application.requestPermission(permissionRequest, this.permissionStatusCallback.bind(this));
                    voltmxmp.logger.trace("--------cant request permission, the user has denied to access permission microphone");
                }
                voltmxmp.logger.trace("----------Exiting checkPermission Function---------", voltmxmp.logger.FUNCTION_EXIT);
                return false;
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
                if(exception.type === "CUSTOM"){
                    throw exception;
                }
            }
        },

        /**
         * @function showMessage
         * @description show message
         * @private
         * @param {string} message
         */
        showMessage: function(message) {
            voltmxmp.logger.trace("In showMessage function", voltmxmp.logger.FUNCTION_ENTRY);
            try {
                var basicConf = {
                    message: message,
                    alertType: constants.ALERT_TYPE_INFO,
                };
                var pspConfig = {
                    "contentAlignment": constants.ALERT_CONTENT_ALIGN_LEFT
                };
                voltmx.ui.Alert(basicConf, pspConfig);
            } catch (exception) {
                voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            }
            voltmxmp.logger.trace("------------Exiting showMessage function---------", voltmxmp.logger.FUNCTION_EXIT);
        },

        /**
         * @function permissionStatusCallback
         * @description handle permission status
         * @private
         * @param {string} message
         */
        permissionStatusCallback: function(response) {
            let message = "";
            if (platform === "android") {
                message = constants.DEFAULT_ANDROID_PERMISSION_ERROR;
            } 
            if (platform === "iphone" || platform === "ipad") {
                message = constants.DEFAULT_IOS_PERMISSION_ERROR;
            }
            if (response.status === voltmx.application.PERMISSION_GRANTED) {
                this.view.flxMicrophone.isVisible = false;
                this.view.forceLayout();
                this.controllerImpl.speechToText();
            } else if (response.status === voltmx.application.PERMISSION_DENIED ||  response.result === 0) {
                this.showMessage(message);
            }
        }
    };
});