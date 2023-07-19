define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.flxDelete.onClick = () => this.onClickDelete();
          this.view.flxHome.onClick = () => this.onClickHome();
          this.initDone = true;
        }
      };
    },
    
    onClickDelete(){},
    onClickHome(){}
  };
});