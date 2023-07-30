define(function() {
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.flxBackground.onClick = () => this.view.isVisible = false;
          this.view.flxNo.onClick = () => this.view.isVisible = false;
          this.view.flxYes.onClick = () => {
            this.view.isVisible = false;
            this.onConfirm(this.data);
          };
          this.initDone = true;
        }
      };
    },

    initGettersSetters: function() {

    },

    show({message, data}){
      this.data = data;
      this.view.lblYes.text = voltmx.i18n.getLocalizedString('i18n.yes');
      this.view.lblNo.text = voltmx.i18n.getLocalizedString('i18n.no');
      this.view.lblMessage.text = message;
      this.view.isVisible = true;
    },

    onConfirm(){}
  };
});