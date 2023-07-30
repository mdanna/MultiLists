define({ 

  onViewCreated(){

    this.view.init = () => {
      this.view.flxBack.onClick = () => new voltmx.mvc.Navigation('frmHome').navigate();
      
      this.view.flxCreate.onClick = () => {
        const lists = voltmx.store.getItem('lists');
        const list = {
          id: `list${new Date().getTime()}`,
          name: ''
        };
        lists.push(list);
        voltmx.store.setItem('lists', lists);
        new voltmx.mvc.Navigation('frmLists').navigate();
      };
    };

    this.view.cmpConfirm.onConfirm = (id) => {
      let lists = voltmx.store.getItem('lists');
      lists = lists.filter((l) => l.id !== id);
      voltmx.store.setItem('lists', lists);
      voltmx.store.removeItem(`tasks_${id}`);
      if(id === voltmx.store.getItem('currentList')){
        voltmx.store.removeItem('currentList');
      }
      const todoLists = this.view.flxLists.widgets();
      this.view.flxLists.removeAt(todoLists.findIndex((w) => w.id === id));
    };

  },

  onNavigate(){
    this.loadTodoLists();
  },

  loadTodoLists(){
    this.view.flxLists.removeAll();
    const lists = voltmx.store.getItem('lists');
    lists.forEach((list) => {
      this.createTodoList(list);
    });
    this.view.flxLists.forceLayout();
  },

  createTodoList(list){
    const id = list.id;
    const todoList = new com.hcl.mario.TodoList({
      id
    }, {}, {});
    todoList.text = list.name;

    todoList.onClickHome = () => {
      new voltmx.mvc.Navigation('frmHome').navigate(id);
    };
    todoList.onClickDelete = () => {
      this.view.cmpConfirm.show({message: voltmx.i18n.getLocalizedString('i18n.confirm.remove'), data: id});
    };
    todoList.onTextChange = () => {
      const text = todoList.text;
      let lists = voltmx.store.getItem('lists');
      const newLists = [];
      lists.forEach((l) => {
        newLists.push({
          id: l.id,
          name: l.id === id ? text : l.name
        });
      });
      voltmx.store.setItem('lists', newLists);
    };
    this.view.flxLists.add(todoList);    
  }

});