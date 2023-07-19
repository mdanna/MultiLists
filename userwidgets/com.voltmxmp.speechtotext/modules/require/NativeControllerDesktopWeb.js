define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Native Controller Web")) || function() {};
    voltmxmp.logger.setLogLevel("DEBUG");
    voltmxmp.logger.enableServerLogging = true;

    var NativeControllerDesktop = function(componentInstance) {
        this.componentInstance = componentInstance;
        NativeController(this);
    };

    Inherits(NativeControllerDesktop, NativeController);

    /**
     * @function speechToText
     * @private
     * @description: This is first step for recognition
     */
    NativeControllerDesktop.prototype.speechToText = function() {
        try {
            voltmxmp.logger.trace("----------Entering speechToText Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if(this.speechRecognition === undefined || this.speechRecognition === null){
                this.showMessage("Speech to text is not supported by this browser");
                throw {
                    "message" : "Speech to text is not supported by this browser"
                };
            }
            this.recognition = new this.speechRecognition();
            // If false, the recording will stop after a few seconds of silence.
            // When true, the silence period is longer (about 15 seconds),
            // allowing us to keep recording even when the user pauses.
            this.recognition.continuous = true;
            this.recognition.onresult = this.onResults.bind(this);
            this.recognition.onstart = this.onReadyForSpeech.bind(this);
            this.recognition.onspeechend = this.onEndOfSpeech.bind(this);
            this.recognition.onspeechstart = this.onBeginningOfSpeech.bind(this);
            this.recognition.onnomatch = this.onError.bind(this,"no match found");
            this.recognition.onend = this.onDisconnected.bind(this);
            this.recognition.onerror = this.onError.bind(this);
            this.recognition.interimResults = true;
            this.recognition.lang = this.componentInstance.setWebLanguage;
            this.recognition.start();
            voltmxmp.logger.trace("----------Exiting speechToText Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
        }
    };
    /**
     * @function stopRecognition
     * @private
     * @description: This function will stop the recognition and gives the final result of the speech
     */
    NativeControllerDesktop.prototype.stopRecognition = function() {
        try {
            voltmxmp.logger.trace("----------Entering stopRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.recognition.stop();
            voltmxmp.logger.trace("----------Exiting stopRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onAndroidSpeechResult
         * @private
         * @description: This function is to set text golbal veriable after end of speech
         */
    NativeControllerDesktop.prototype.onSpeechResult = function() {
        try {
            voltmxmp.logger.trace("----------Entering onSpeechResult Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if(this.eventObj !== undefined && this.eventObj !== null){
                var numberOfSentences = this.eventObj.results.length;
                var resultSpeech = "";
                for(var i=0;i<numberOfSentences;i++){
                    var sentence = this.eventObj.results[i][0].transcript;
                    resultSpeech+=sentence;
                }
                this.componentInstance.invokeCallback(resultSpeech);
            }
            voltmxmp.logger.trace("----------Exiting onSpeechResults Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onReadyForSpeechAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerDesktop.prototype.onReadyForSpeech = function() {
        try {
            voltmxmp.logger.trace("----------entering onReadyForSpeech Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.componentInstance.view.flxMicrophone.isVisible = false;
            this.componentInstance.view.flxAnim.isVisible = true;
            this.componentInstance.view.forceLayout();
            this.eventObj = {};
            voltmxmp.logger.trace("----------exiting onReadyForSpeech Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onBeginningOfSpeechAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerDesktop.prototype.onBeginningOfSpeech = function() {
        try {
            voltmxmp.logger.trace("----------entering onBeginngofSpeech Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.componentInstance.view.imgGif.isVisible = true;
            this.componentInstance.view.forceLayout();
            voltmxmp.logger.trace("----------exiting onBeginingForSpeech Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onResultsAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerDesktop.prototype.onResults = function(event) {
        try {
            voltmxmp.logger.trace("----------entering onResults Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.eventObj = event;
            var text = event.results[event.resultIndex][0].transcript;
            this.partialResults(text);
            voltmxmp.logger.trace("----------exiting onResults Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onErrorAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerDesktop.prototype.onError = function(error) {
        try {
            voltmxmp.logger.trace("----------entering onError Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (error.error.toLowerCase() === "not-allowed"){
                this.showMessage("Please grant the microphone permission");                
            }
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onEndOfSpeechAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerDesktop.prototype.onEndOfSpeech = function() {
        try {
            voltmxmp.logger.trace("----------entering onEndOfSpeech Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.onSpeechResult();
            voltmxmp.logger.trace("----------exiting onEndOfSpeech Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function partialResults
         * @private
         * @description: This function is to trigger partial results event
         */
    NativeControllerDesktop.prototype.partialResults = function(text) {
        try {
            voltmxmp.logger.trace("----------Entering partialResults Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.componentInstance.partialSpeechResults !== undefined && this.componentInstance.partialSpeechResults !== null) {
                this.componentInstance.partialSpeechResults(text);
            }
            voltmxmp.logger.trace("----------Exiting partialResults Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    NativeControllerDesktop.prototype.requestPermission = function(){
        // this method for future permission request 
    };

    /**
         * @function onDisconnected
         * @private
         * @description: This is called when Speech recognition service disconnected
         */
    NativeControllerDesktop.prototype.onDisconnected = function() {
        try {
            voltmxmp.logger.trace("----------entering onEndOfSpeech Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            voltmxmp.logger.trace("----------exiting onEndOfSpeech Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };

    /**
      * @function showMessage
      * @description show message
      * @private
      * @param {string} message
      */
    NativeControllerDesktop.prototype.showMessage = function(message) {
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
    };

    return NativeControllerDesktop;
});
