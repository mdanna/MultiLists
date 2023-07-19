define(['./Inherits', './NativeController'], function(Inherits, NativeController) {
    var voltmxLoggerModule = require('com/voltmxmp/speechtotext/voltmxLogger');
    var voltmxmp = voltmxmp || {};
    voltmxmp.logger = (new voltmxLoggerModule("Native Controller Android")) || function() {};
    voltmxmp.logger.setLogLevel("DEBUG");
    voltmxmp.logger.enableServerLogging = true;

    var NativeControllerAndroid = function(componentInstance) {
        this.componentInstance = componentInstance;
        NativeController(this);
        this.importClasses();
    };

    Inherits(NativeControllerAndroid, NativeController);

    /**
     * @function importClasses
     * @private
     * @description: this function will import all the classes from the franeworks and store in the nativeClasses variable
     */
    NativeControllerAndroid.prototype.importClasses = function() {
        try {
            voltmxmp.logger.trace("----------Entering importClasses Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.voltmxMain = java.import('com.konylabs.android.KonyMain');
            this.Locale = java.import("java.util.Locale");
            this.recognizerIntent = java.import("android.speech.RecognizerIntent");
            this.speechRecognizer = java.import("android.speech.SpeechRecognizer");
            this.Intent = java.import("android.content.Intent");
            this.contextCompat = java.import("androidx.core.content.ContextCompat");
            this.manifest = java.import("android.Manifest");
            this.packageManager = java.import("android.content.pm.PackageManager");
            this.activityCompact = java.import("androidx.core.app.ActivityCompat");
            this.permission = java.import("konymp.com.request.RequestPermission");      
            this.mLocale = this.Locale.getDefault();
            this.mContext = this.voltmxMain.getActivityContext();
            this.recognitionListener = java.newClass('recognitionListener', 'java.lang.Object', ['android.speech.RecognitionListener'], {
                onReadyForSpeech: this.onReadyForSpeechAndroid.bind(this),
                onBeginningOfSpeech: this.onBeginningOfSpeechAndroid.bind(this),
                onRmsChanged: this.onRmsChangedAndroid.bind(this),
                onPartialResults: this.onPartialResultsAndroid.bind(this),
                onResults: this.onResultsAndroid.bind(this),
                onError: this.onErrorAndroid.bind(this),
                onBufferReceived: this.onBufferReceivedAndroid.bind(this),
                onEndOfSpeech: this.onEndOfSpeechAndroid.bind(this),
                onEvent: this.onEventAndroid.bind(this)
            });
            this.requestPermission();
            voltmxmp.logger.trace("----------Exiting importClasses Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
     * @description: This is first step for recognition
     */
    NativeControllerAndroid.prototype.speechToText = function() {
        try {
            voltmxmp.logger.trace("----------Entering speechToText Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.request()) {
                voltmx.application.showLoadingScreen();
                this.mSpeechRecognizer = null;
                voltmx.runOnMainThread(this.startListening.bind(this), []);
            } else {
                this.componentInstance.resetUI();
            }
            voltmxmp.logger.trace("----------Exiting speechToText Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmx.application.dismissLoadingScreen();
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
     * @function startListening
     * @private
     * @description: This function will start listening
     */
    NativeControllerAndroid.prototype.startListening = function() {
        try {
            voltmxmp.logger.trace("----------Entering startListening Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.mSpeechRecognizer = this.speechRecognizer.createSpeechRecognizer(this.mContext);
            this.mSpeechRecognizer.setRecognitionListener(new this.recognitionListener());
            this.intent = new this.Intent(this.recognizerIntent.ACTION_RECOGNIZE_SPEECH);
            this.intent.putExtra(this.recognizerIntent.EXTRA_MAX_RESULTS, 1);
            this.intent.putExtra(this.recognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            this.intent.putExtra(this.recognizerIntent.EXTRA_LANGUAGE, this.componentInstance.setAndroidLanguage);
            this.intent.putExtra(this.recognizerIntent.EXTRA_LANGUAGE_MODEL, this.recognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            this.intent.putExtra(this.recognizerIntent.EXTRA_CALLING_PACKAGE, this.mContext.getBasePackageName());
            // Requested to set to 30 seconds by QA.
            this.intent.putExtra(this.recognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 30000);
            this.mSpeechRecognizer.startListening(this.intent);
            voltmxmp.logger.trace("----------Exiting startListening Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
     * @description: This function will stop the recognition and gives the final result of the speech
     */
    NativeControllerAndroid.prototype.stopRecognition = function() {
        try {
            voltmxmp.logger.trace("----------Entering stopRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            voltmx.runOnMainThread(function() {
                this.mSpeechRecognizer.stopListening();
            }.bind(this), "");
            this.componentInstance.resetUI();
            this.stopAndroidRecognition();
            voltmxmp.logger.trace("----------Exiting stopRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
     * @function requestPermission
     * @private
     * @description: This function will check for permissions
     */
    NativeControllerAndroid.prototype.request = function() {
        try {
            if (this.contextCompat.checkSelfPermission(this.mContext, this.manifest.permission.RECORD_AUDIO) !== this.packageManager.PERMISSION_GRANTED) {
                return false;
            }
            return true;
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
    NativeControllerAndroid.prototype.onAndroidSpeechResult = function(speechText) {
        try {
            voltmxmp.logger.trace("----------Entering onAndroidSpeechResult Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this._text = speechText;
            this.stopRecognition();
            voltmxmp.logger.trace("----------Exiting onAndroidSpeechResults Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.onReadyForSpeechAndroid = function(bundle) {
        try {
            voltmxmp.logger.trace("----------entering onReadyForSpeechAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            voltmx.application.dismissLoadingScreen();
            this.componentInstance.view.flxMicrophone.isVisible = false;
            this.componentInstance.view.flxAnim.isVisible = true;
            if (this.componentInstance.onReadyForSpeech !== undefined && this.componentInstance.onReadyForSpeech !== null) {
                this.componentInstance.onReadyForSpeech(bundle);
            }
            voltmxmp.logger.trace("----------exiting onReadyForSpeechAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.onBeginningOfSpeechAndroid = function() {
        try {
            voltmxmp.logger.trace("----------entering onBeginngofSpeechandroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.componentInstance.view.imgGif.isVisible = true;
            if (this.componentInstance.onBeginningOfSpeech !== undefined && this.componentInstance.onBeginningOfSpeech !== null) {
                this.componentInstance.onBeginningOfSpeech();
            }
            voltmxmp.logger.trace("----------exiting onBeginingForSpeechAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onRmsChangedAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerAndroid.prototype.onRmsChangedAndroid = function(v) {
        try {
            voltmxmp.logger.trace("----------entering onRmsChangedndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.componentInstance.onRmsChanged !== undefined && this.componentInstance.onRmsChanged !== null) {
                this.componentInstance.onRmsChanged(v);
            }
            voltmxmp.logger.trace("----------exiting onRmsChangedAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onPartialResultsAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerAndroid.prototype.onPartialResultsAndroid = function(bundle) {
        try {
            voltmxmp.logger.trace("----------entering onPartialResultsAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.partialResults(bundle.getStringArrayList(this.speechRecognizer.RESULTS_RECOGNITION).get(0));
            voltmxmp.logger.trace("----------exiting onPartialResultsAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.onResultsAndroid = function(bundle) {
        try {
            voltmxmp.logger.trace("----------entering onResultsAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.onAndroidSpeechResult(bundle.getStringArrayList(this.speechRecognizer.RESULTS_RECOGNITION).get(0));
            voltmxmp.logger.trace("----------exiting onResultsAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.onErrorAndroid = function(code) {
        try {
            voltmxmp.logger.trace("----------entering onErrorAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.componentInstance.resetUI();
            if (this.componentInstance.onError !== undefined && this.componentInstance.onError !== null) {
                this.componentInstance.onError(code);
            }

            voltmxmp.logger.trace("----------exiting onErrorAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onBufferReceivedAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerAndroid.prototype.onBufferReceivedAndroid = function(bytes) {
        try {
            voltmxmp.logger.trace("----------entering onBufferReceivedAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.componentInstance.onBufferReceived !== undefined && this.componentInstance.onBufferReceived !== null) {
                this.componentInstance.onBufferReceived(bytes);
            }
            voltmxmp.logger.trace("----------exiting onBufferReceivedAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.onEndOfSpeechAndroid = function() {
        try {
            voltmxmp.logger.trace("----------entering onEndOfSpeechAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            this.componentInstance.view.imgGif.isVisible = false;
            if (this.componentInstance.onEndOfSpeech !== undefined && this.componentInstance.onEndOfSpeech !== null) {
                this.componentInstance.onEndOfSpeech();
            }
            voltmxmp.logger.trace("----------exiting onEndOfSpeechAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function onEventAndroid
         * @private
         * @description: This is called from listener callback
         */
    NativeControllerAndroid.prototype.onEventAndroid = function(i, bundle) {
        try {
            voltmxmp.logger.trace("----------entering onEventAndroid Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.componentInstance.onEvent !== undefined && this.componentInstance.onEvent !== null) {
                this.componentInstance.onEvent(i, bundle);
            }
            voltmxmp.logger.trace("----------exiting onEventAndroid Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };
    /**
         * @function stopAndroidRecognition
         * @private
         * @description: This function will stop android recognition
         */
    NativeControllerAndroid.prototype.stopAndroidRecognition = function() {
        try {
            voltmxmp.logger.trace("----------Entering stopAndroidRecognition Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this._text !== "") {
                this.componentInstance.invokeCallback(this._text);
            }
            this._text = "";
            voltmxmp.logger.trace("----------Exiting stopAndroidRecognition Function---------", voltmxmp.logger.FUNCTION_EXIT);
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
    NativeControllerAndroid.prototype.partialResults = function(text) {
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
    NativeControllerAndroid.prototype.requestPermission = function(){
        try {
            voltmxmp.logger.trace("----------Entering requestPermission Function---------", voltmxmp.logger.FUNCTION_ENTRY);
            if (this.contextCompat.checkSelfPermission(this.mContext, this.manifest.permission.RECORD_AUDIO) !== this.packageManager.PERMISSION_GRANTED) {
                var obj = new this.permission();
                obj.requestPermissions(this.mContext,"android.permission.RECORD_AUDIO");
            }
            voltmxmp.logger.trace("----------Exiting requestPermission Function---------", voltmxmp.logger.FUNCTION_EXIT);
        } catch (exception) {
            voltmxmp.logger.error(JSON.stringify(exception), voltmxmp.logger.EXCEPTION);
            if(exception.type === "CUSTOM"){
                throw exception;
            }
        }
    };

    return NativeControllerAndroid;
});
