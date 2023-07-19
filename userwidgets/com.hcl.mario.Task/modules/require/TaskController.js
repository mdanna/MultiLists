define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig) {
      this.view.flxCheckbox.onClick = () => {
        this.isDone = !this.isDone;
        eventManager.publish('updateTask', this.view.lblTaskName.text);
      };
      
      let start = 0;
      this.view.onTouchStart = () => {
        start = new Date().getTime();
      };
      
      this.view.onTouchEnd = () => {
        if(start && this.isDone){
          const now = new Date().getTime();
          if(now - start > 1000){
            start = 0;
            eventManager.publish('deleteTask', this.view.lblTaskName.text);
          }
        }
      };
      
    },
    
    initGettersSetters() {
      defineGetter(this, 'isDone', () => {
        return this._isDone;
      });
      defineSetter(this, 'isDone', value => {
        this._isDone = value;
        this.view.lblChecked.isVisible = !!value;
        this.view.lblUnchecked.isVisible = !value;
        this.view.lblTaskName.textStyle = {
          strikeThrough: !!value
        };
      });
    }
  };
});