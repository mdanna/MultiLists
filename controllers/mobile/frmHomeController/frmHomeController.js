define({
  currentList: null,
  lists: [],
  tasks: [],

  onViewCreated(){

    this.view.init = () => {
      voltmx.store.getItem('language') || voltmx.store.setItem('language', 'en');
      const language = voltmx.store.getItem('language');
      voltmx.i18n.setCurrentLocaleAsync(language, () => {
        this.view.imgLanguage.src = `${language}.png`;
        voltmx.print(`Set language: ${language}`);
      }, (error) => {
        voltmx.print('Unable to set locale');
      });

      this.view.flxCircle.onClick = () => new voltmx.mvc.Navigation('frmLists').navigate();
      this.view.flxLanguage.onClick = () => this.view.cmpLanguageSelector.show();
      this.view.flxFloatingButton.onClick = () => this.view.cmpAddTask.toggle(true);

    };

    this.view.preShow = () => {
      this.navigationContext && voltmx.store.setItem('currentList', this.navigationContext);
      if(!voltmx.store.getItem('lists') || !voltmx.store.getItem('lists').length){
        this.lists = [];
      } else {
        this.lists = voltmx.store.getItem('lists');
      }
      
      if(this.lists.length === 0){
        const listId = `list${new Date().getTime()}`;
        this.currentList = listId;
        this.lists.push({
          id: listId,
          name: 'My List'
        });
        voltmx.store.setItem('currentList', listId);
        voltmx.store.setItem('lists', this.lists);
      } else {
        this.currentList = voltmx.store.getItem('currentList') || this.lists[0].id;
      }
      this.lists = voltmx.store.getItem('lists');
      this.tasks = voltmx.store.getItem(`tasks_${this.currentList}`) || [];
    };

    this.view.postShow = () => {
      eventManager.publish(globals.EVT_CHANGE_LANGUAGE, globals.languages[voltmx.store.getItem('language')]);
      this.view.lblTodoey.text = this.lists.find((l) => l.id === this.currentList).name;
      this.loadTasks();
    };

    eventManager.subscribe(globals.EVT_CHANGE_LANGUAGE, (language) => {
      this.view.lblCount.text = `${this.tasks.length} ${this.tasks.length === 1 ? voltmx.i18n.getLocalizedString('i18n.item') : voltmx.i18n.getLocalizedString('i18n.items')}`;
      this.view.imgLanguage.src = `${language.substring(0, 2)}.png`;
    });

    eventManager.subscribe('addTask', (taskName) => {
      if(this.tasks.find((t) => t.taskName === taskName)){
        alert(`Task ${taskName} already exists.`);
      } else {
        this.tasks.push({taskName, isDone: false});
        voltmx.store.setItem(`tasks_${this.currentList}`, this.tasks);
        this.loadTasks();
      }
    });

    eventManager.subscribe('deleteTask', (taskName) => {
      this.tasks = this.tasks.filter((t) => t.taskName !== taskName);
      voltmx.store.setItem(`tasks_${this.currentList}`, this.tasks);
      this.loadTasks();
    });

    eventManager.subscribe('updateTask', (taskName) => {
      this.tasks.forEach((t) => t.taskName === taskName && (t.isDone = !t.isDone));
      voltmx.store.setItem(`tasks_${this.currentList}`, this.tasks);
    });
  },

  loadTasks(){
    this.view.flsTaskList.removeAll();
    this.tasks.forEach((t) => {
      const task = new com.hcl.mario.Task({
        id: `task${new Date().getTime()}`,
        width: `${voltmx.os.deviceInfo().screenWidth - 60}dp`
      }, {}, {});
      task.taskName = t.taskName;
      task.isDone = t.isDone;
      this.view.flsTaskList.add(task);
    });
    this.view.lblCount.text = `${this.tasks.length} ${this.tasks.length === 1 ? voltmx.i18n.getLocalizedString('i18n.item') : voltmx.i18n.getLocalizedString('i18n.items')}`;
    this.view.flsTaskList.forceLayout();
  }
});