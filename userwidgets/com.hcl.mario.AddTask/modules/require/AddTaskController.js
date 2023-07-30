define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig) {
      eventManager.subscribe('changeLanguage', (language) => {
        this.initLanguage(language);
      });

      this.view.flxBackground.onClick = () => this.toggle(false);
      this.view.flxClose.onClick = () => this.toggle(false);

      this.view.flxAddTask.onClick = () => {
        const taskName = this.view.txtAddTaskName.text;
        if(taskName){
          eventManager.publish('addTask', taskName);
          this.toggle(false);
        }
      };

      this.view.speechtotext.speechCallback = (speechText) => {
        this.view.txtAddTaskName.text = speechText;
        this.view.forceLayout();
      };

      this.view.preShow = () => {
        if(!this.initDone){
          this.initLanguage((voltmx.i18n.getCurrentLocale() || 'en').substring(0, 2));
          this.initDone = true;  
        }
      };
    },

    initLanguage(language){
      this.view.lblAddTask.text = voltmx.i18n.getLocalizedString('i18n.add.item');
      this.view.lblAdd.text = voltmx.i18n.getLocalizedString('i18n.add');
      this.view.speechtotext.setAndroidLanguage = language;
      this.view.speechtotext.setIphoneLanguage = language;
      this.view.speechtotext.setWebLanguage = language;
    },

    initGettersSetters() {},

    toggle(show){
      this.view.isVisible = !!show;
      show && this.view.txtAddTaskName.setFocus(true);
      show && (this.view.txtAddTaskName.text = '');
    }
  };
});