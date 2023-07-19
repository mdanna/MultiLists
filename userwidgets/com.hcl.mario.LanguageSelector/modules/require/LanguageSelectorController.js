define(function() {
  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.flxBackground.onClick = () => this.view.isVisible = false;
          this.view.flxEditClose.onClick = () => this.view.isVisible = false;
          this.view.segLanguageSelector.onRowClick = () => {
            const selectedItem = this.view.segLanguageSelector.selectedRowItems[0].language;
            voltmx.store.setItem('language', selectedItem);
            voltmx.i18n.setCurrentLocaleAsync(selectedItem, () => {
              eventManager.publish(globals.EVT_CHANGE_LANGUAGE, globals.languages[selectedItem]);
              this.view.isVisible = false;
            }, (error) => alert(JSON.stringify(error)));
          };
          this.initDone = true;
        }
      };
    },

    initGettersSetters: function() {

    },

    show(){
      const data = [];
      let language = voltmx.i18n.getCurrentLocale() || 'en';
      language = language.substring(0, 2);
      Object.keys(globals.languages).forEach((lan) => data.push ({
        language: lan,
        imgLanguage: `${lan}.png`,
        lblLanguage: voltmx.i18n.getLocalizedString(`i18n.language.${lan}`),
        flxLanguageSelector: {
          skin: lan === language ? 'skinFlxGrey' : 'slFbox' 
        }
      }));
      
      data.sort((a, b) => {
        let ret = 0;
        a.lblLanguage > b.lblLanguage && (ret = 1);
        a.lblLanguage < b.lblLanguage && (ret = -1);
        return ret;
      });
      this.view.segLanguageSelector.setData(data);
      this.view.isVisible = true;
    },

    onSelect(){}
  };
});