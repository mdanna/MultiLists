define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Speech To Text Component")) || function() {};
    voltmxmp.logger.setLogLevel("DEBUG");
    voltmxmp.logger.enableServerLogging = true;

    var NativeControllerIOS = function(componentInstance) {
        this.componentInstance = componentInstance;
        NativeController(this);
        this.importClasses();
    };

    Inherits(NativeControllerIOS, NativeController);

    /**
     * @function importClasses
     * @private
     * @description: this function will import all the classes from the franeworks and store in the nativeClasses variable
     */
    NativeControllerIOS.prototype.importClasses = function() {
        try {
            voltmxmp.logger.trace("----------Entering importClasses Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.audioSession = objc.import('AVAudioSession').sharedInstance();
            this.SFSpeechAudioBufferRecognitionRequest = objc.import('SFSpeechAudioBufferRecognitionRequest');
            this.audioEngineClass = objc.import('AVAudioEngine');
            this.SFSpeechRecognizer = objc.import('SFSpeechRecognizer');
            this.NSLocale = objc.import("NSLocale");
            var recognizerDelegate = objc.newClass('recognizerDelegate' + this.getRandomNumber(), 'NSObject', ['SFSpeechRecognizerDelegate'], {
                speechRecognizerAvailabilityDidChange: function(available) {
                    voltmxmp.logger.info(available.toString(), voltmxmp.logger.SUCCESS_CALLBACK);
                }
            });
            this.recognizerDelegateObj = recognizerDelegate.jsnew();
            voltmxmp.logger.trace("----------Exiting importClasses Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function createAudioEngine
     * @private
     * @description: this function creates audio engine variable
     */
    NativeControllerIOS.prototype.createAudioEngine = function() {
        try {
            voltmxmp.logger.trace("----------entering createAudioEngine Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.audioEngine = this.audioEngineClass.alloc().jsinit();
            var set = this.SFSpeechRecognizer.supportedLocales().allObjects;
            this.locale = this.NSLocale.alloc().initWithLocaleIdentifier(this.componentInstance._iosLanguage);
            for (var i = 0; i < set.length; i++) {
                if (set[i].localeIdentifier === this.locale.localeIdentifier) {
                    this._isValidLanguage = true;
                    break;
                }
            }
            if (this._isValidLanguage) {
                this.recognizer = this.SFSpeechRecognizer.alloc().initWithLocale(this.locale);
                if (this.recognizer !== undefined && this.recognizer !== null) {
                    this.recognizer.delegate = this.recognizerDelegateObj;
                    const self = this;
                    this.SFSpeechRecognizer.requestAuthorization(function(authStatus) {
                        const SFSpeechRecognizerAuthorizationStatus = {
                            notDetermined: 0,
                            restricted: 2,
                            denied: 1,
                            authorized: 3,
                        };
                        if (authStatus === SFSpeechRecognizerAuthorizationStatus.authorized){
                            voltmx.runOnMainThread(function() {
                                self.componentInstance.view.flxMicrophone.isVisible = false;
                                self.componentInstance.view.flxAnim.isVisible = true;
                            }.bind(this), []);                           
                        } else if (authStatus === SFSpeechRecognizerAuthorizationStatus.denied) {
                            voltmx.runOnMainThread(function() {
                                self.componentInstance.view.flxMicrophone.isVisible = true;
                                self.showMessage("Please ensure permissions for both Speech recognition & Microphone are granted in device settings");
                            }.bind(this), []);
                        } else if (authStatus === SFSpeechRecognizerAuthorizationStatus.restricted) {
                            voltmx.runOnMainThread(function() {
                                self.showMessage("The device prevents your app from performing speech recognition.");
                            }.bind(this), []);                       
                        }
                    });
                    return true;
                } else {
                    voltmxmp.logger.trace("----------exiting createAudioEngine Function---------", voltmxmp.logger.FUNCTION_EXIT);
                    return false;
                }
            } else {
                voltmxmp.logger.trace("----------exiting createAudioEngine Function---------", voltmxmp.logger.FUNCTION_EXIT);
                throw {
                    "type": "CUSTOM",
                    "Error": "language",
                    "message": "language is not supported by the device"
                };
            }
        } catch (exception) {            
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function getRandomNumber
     * @private
     * @description: This function will generate random number
     */
    NativeControllerIOS.prototype.getRandomNumber = function() {
        try {
            voltmxmp.logger.trace("----------Entering getRandomNumber Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            var seed = Math.random();
            var x = (Math.sin(seed++) * 10000);
            var randomNumber = x - Math.floor(x);
            return randomNumber;
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
        voltmxmp.logger.trace("----------Exiting getRandomNumber Function---------", voltmxmp.logger.FUNCTION_EXIT);

    };
    /**
     * @function speechToText
     * @private
     * @description: This is first step for recognition
     */
    NativeControllerIOS.prototype.speechToText = function() {
        try {
            voltmxmp.logger.trace("----------Entering iosSpeechToText Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.recognitionTask = null;
            this.recognitionRequest = null;
            var isObjectCreated = this.createAudioEngine();
            if (!isObjectCreated) {
                throw {
                    "type": "CUSTOM",
                    "Error": "Recognition",
                    "message": "unable to create recognition object w5"
                };
            }
            this.iosStartListening();
            voltmxmp.logger.trace("----------Exiting iosSpeechToText Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function iosStartListening
     * @private
     * @description: This function start listening
     */
    NativeControllerIOS.prototype.iosStartListening = function() {
        try {
            voltmxmp.logger.trace("----------Entering iosStartListening Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (!this.audioEngine.running) {
                this.audioSession.setCategoryWithOptionsError(AVAudioSessionCategoryPlayAndRecord, AVAudioSessionCategoryOptionDefaultToSpeaker, undefined);
                this.audioSession.setModeError(AVAudioSessionModeMeasurement, undefined);
                this.audioSession.setActiveWithOptionsError(true, AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation, undefined);
                this.inputNode = this.audioEngine.inputNode;
                this.recognitionRequest = this.SFSpeechAudioBufferRecognitionRequest.jsnew();
                this.recognitionRequest.shouldReportPartialResults = true;
                voltmx.runOnMainThread(function() {
                    if  (this.componentInstance.view.flxAnim.isVisible){
                        this.componentInstance.view.imgGif.isVisible = true;
                    }
                }.bind(this), []);
                this.recognitionTask = this.recognizer.recognitionTaskWithRequestResultHandler(this.recognitionRequest, this.resultHandler.bind(this));
                this.inputNode.installTapOnBusBufferSizeFormatBlock(this.componentInstance._avAudioBus,
                                                                    this.componentInstance._bufferSize,
                                                                    this.inputNode.outputFormatForBus(this.componentInstance._avAudioBus),
                                                                    function(buf, when) {
                    this.recognitionRequest.appendAudioPCMBuffer(buf);
                }.bind(this));
                this.audioEngine.prepare();
                var isStarted = this.audioEngine.startAndReturnError(undefined);
                if(!isStarted){
                    throw {
                        "type" : "DEV",
                        "Error" : "AudioEngine",
                        "message" : "unable to start Audio Engine"};
                }
            } else {
                voltmxmp.logger.info('Audio Engine is already running!');
            }
            voltmxmp.logger.trace("----------Exiting iosStartListening Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function resultHandler
     * @private
     * @description: This function will handle results
     */
    NativeControllerIOS.prototype.resultHandler = function(result, error) {
        try {
            voltmxmp.logger.trace("----------Entering resultHandler Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (result) {
                if (result.final) {
                    var text = result.bestTranscription.formattedString;
                    this.stopRecognition(text);
                }
                this.partialResults(result.bestTranscription.formattedString);
            }
            if (error) {
                this.inputNode.removeTapOnBus(0);
                this.stopRecognition("");
                throw error;
            }
            voltmxmp.logger.trace("----------Exiting resultHandler Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function stopRecognition
     * @private
     * @description: This function will stop the recognition and gives the final result of the speech
     */
    NativeControllerIOS.prototype.stopRecognition = function(text) {
        try {
            voltmxmp.logger.trace("----------Entering stopRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.recognitionRequest.endAudio();
            this.audioEngine.stop();
            this.inputNode.removeTapOnBus(0);
            this.stopIosRecognition(text);
            voltmxmp.logger.trace("----------Exiting stopRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function stopIosRecognition
     * @private
     * @description: This function will stop ios recognition
     */
    NativeControllerIOS.prototype.stopIosRecognition = function(text) {
        try {
            voltmxmp.logger.trace("----------Entering stopIosRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (text !== "" && text !== null && text !== undefined) {
                this.componentInstance.invokeCallback(text);
            }
            text = null;
            voltmxmp.logger.trace("----------Exiting stopIosRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    /**
     * @function partialResults
     * @private
     * @description: This function is to trigger partial results event
     */
    NativeControllerIOS.prototype.partialResults = function(text) {
        try {
            voltmxmp.logger.trace("----------Entering partialResults Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.componentInstance.partialSpeechResults !== undefined && this.componentInstance.partialSpeechResults !== null) {
                this.componentInstance.partialSpeechResults(text);
            }
            voltmxmp.logger.trace("----------Exiting partialResults Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if (exception.type === "CUSTOM") {
                throw exception;
            }
        }
    };
    NativeControllerIOS.prototype.requestPermission = function(){
        // this method for future permission request
    };

    /**
     * @function showMessage
     * @description show message
     * @private
     * @param {string} message
     */
    NativeControllerIOS.prototype.showMessage = function(message) {
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

    return NativeControllerIOS;
});
