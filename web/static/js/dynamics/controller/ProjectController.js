/**
 * Project controller.
 * 
 * @constructor
 * @base BacklogController
 * @param {Integer} id Project id.
 * @param {DOMElement} element DOM parent node for the story table. 
 */
var ProjectController = function ProjectController(options) {
  this.id = options.id;
  this.parentView = options.storyListElement;
  this.projectDetailsElement = options.projectDetailsElement;
  this.assigmentListElement = options.assigmentListElement;
  this.iterationListElement = options.iterationListElement;
  this.hourEntryListElement = options.hourEntryListElement;

  this.init();
  this.initializeProjectDetailsConfig();
  this.initAssigneeConfiguration();
  this.initializeIterationListConfig();
  this.initializeStoryConfig();
  
  this.paint();
};
ProjectController.prototype = new BacklogController();

/**
 * Indices for column configuration
 * @member ProjectController
 */
ProjectController.columnIndices = {
    status: 0,
    name: 1,
    startDate: 2,
    endDate: 3,
    actions: 4,
    description: 5,
    buttons: 6
};

/**
 * Creates a new story controller.
 */
ProjectController.prototype.storyControllerFactory = function(view, model) {
  var storyController = new StoryController(model, view, this);
  this.addChildController("story", storyController);
  return storyController;
};

ProjectController.prototype.iterationRowControllerFactory = function(view, model) {
  var iterationController = new IterationRowController(model, view, this);
  this.addChildController("iteration", iterationController);
  return iterationController;
};

ProjectController.prototype.paintStoryList = function() {
  this.storyListView = new DynamicTable(this, this.model, this.storyListConfig,
      this.parentView);
  this.storyListView.render();
};

ProjectController.prototype.paintProjectDetails = function() {
  this.projectDetailsView = new DynamicVerticalTable(this, this.model, this.projectDetailConfig,
      this.projectDetailsElement);
  this.projectDetailsView.render();
};

ProjectController.prototype.paintIterationList = function() {
  this.iterationsView = new DynamicTable(this, this.model, this.iterationListConfig,
      this.iterationListElement);
  this.iterationsView.render();
};

/**
 * Initialize and render the story list.
 */
ProjectController.prototype.paint = function() {
  var me = this;
  ModelFactory.initializeFor(ModelFactory.initializeForTypes.project,
      this.id, function(model) {
        me.model = model;
        me.paintProjectDetails();
        me.paintAssigneeList();
        me.paintStoryList();
        me.paintIterationList();
      });
};

/**
 * Populate a new, editable iteration row to the iterations table.
 */
ProjectController.prototype.createIteration = function() {
  var mockModel = ModelFactory.createObject(ModelFactory.typeToClassName.iteration);
  mockModel.setParent(this.model);
  mockModel.setStartDate(new Date().getTime());
  mockModel.setEndDate(new Date().getTime());
  var controller = new IterationRowController(mockModel, null, this);
  var row = this.iterationsView.createRow(controller, mockModel, "top");
  controller.view = row;
  row.autoCreateCells([IterationRowController.columnIndices.actions]);
  row.render();
  controller.openRowEdit();
};

/**
 * Populate a new, editable story row to the story table. 
 */
ProjectController.prototype.createStory = function() {
  var mockModel = ModelFactory.createObject(ModelFactory.types.story);
  mockModel.setBacklog(this.model);
  var controller = new StoryController(mockModel, null, this);
  var row = this.storyListView.createRow(controller, mockModel, "top");
  controller.view = row;
  row.autoCreateCells([StoryController.columnIndices.priority, StoryController.columnIndices.actions, StoryController.columnIndices.tasksData]);
  row.render();
  controller.openRowEdit();
};

/**
 * Construct edit buttons.
 */
ProjectController.prototype.projectActionFactory = function(view, model) {
  var actionItems = [ {
    text : "Edit",
    callback : ProjectController.prototype.editProject
  }, {
    text : "Move",
    callback : ProjectController.prototype.moveProject
  }, {
    text : "Delete",
    callback : ProjectController.prototype.removeProject
  } ];
  var actionView = new DynamicTableRowActions(actionItems, this, this.model,
      view);
  return actionView;
};

/**
 * Initialize project details configuration.
 */
ProjectController.prototype.initializeProjectDetailsConfig = function() {
  var config = new DynamicTableConfiguration( {
    leftWidth: '20%',
    rightWidth: '79%',
    closeRowCallback: null,
    validators: [ BacklogModel.Validators.dateValidator ]
  });
  config.addColumnConfiguration(0, {
    title : "Name",
    get : ProjectModel.prototype.getName,
    editable : true,
    edit : {
      editor : "Text",
      required: true,
      set: ProjectModel.prototype.setName
    }
  });
  config.addColumnConfiguration(1, {
    title : "Start Date",
    get : ProjectModel.prototype.getStartDate,
    decorator: DynamicsDecorators.dateTimeDecorator,
    editable : true,
    edit : {
      editor : "Date",
      decorator: DynamicsDecorators.dateTimeDecorator,
      required: true,
      withTime: true,
      set: ProjectModel.prototype.setStartDate
    }
  });  
  config.addColumnConfiguration(2, {
    title : "End Date",
    get : ProjectModel.prototype.getEndDate,
    decorator: DynamicsDecorators.dateTimeDecorator,
    editable : true,
    edit : {
      editor : "Date",
      decorator: DynamicsDecorators.dateTimeDecorator,
      required: true,
      withTime: true,
      set: ProjectModel.prototype.setEndDate
    }
  });
  config.addColumnConfiguration(3, {
    title : "Planned Size",
    title : "Planned Size",
    get : ProjectModel.prototype.getBacklogSize,
    decorator: DynamicsDecorators.exactEstimateDecorator,
    editable: true,
    edit: {
      editor: "ExactEstimate",
      decorator: DynamicsDecorators.exactEstimateEditDecorator,
      set : ProjectModel.prototype.setBacklogSize
    }
  });
  config.addColumnConfiguration(4, {
    title : "Baseline load",
    get : ProjectModel.prototype.getBaselineLoad,
    decorator: DynamicsDecorators.exactEstimateDecorator,
    editable: true,
    edit: {
      editor: "ExactEstimate",
      decorator: DynamicsDecorators.exactEstimateEditDecorator,
      set : ProjectModel.prototype.setBaselineLoad
    }
  });
  config.addColumnConfiguration(5, {
    title : "Description",
    get : ProjectModel.prototype.getDescription,
    editable : true,
    edit : {
      editor : "Wysiwyg",
      set: ProjectModel.prototype.setDescription
    }
  });
  this.projectDetailConfig = config;
};

/**
 * Initialize configuration for iteration lists.
 */
ProjectController.prototype.initializeIterationListConfig = function() {
  var config = new DynamicTableConfiguration( {
    rowControllerFactory : ProjectController.prototype.iterationRowControllerFactory,
    dataSource : ProjectModel.prototype.getIterations,
    caption : "Iterations",
    rowDroppable: true,
    dropOptions: {
      accepts: IterationRowController.prototype.acceptsDroppable,
      callback: StoryController.prototype.moveStoryToBacklog
    },
    cssClass: "project-iteration-table",
    validators: [ BacklogModel.Validators.dateValidator ]
  });
  this._iterationListColumnConfig(config);
  config.addCaptionItem( {
    name : "createIteration",
    text : "Create iteration",
    cssClass : "create",
    callback : ProjectController.prototype.createIteration
  });
  this.iterationListConfig = config;
};



ProjectController.prototype._iterationListColumnConfig = function(config) {
  config.addColumnConfiguration(IterationRowController.columnIndices.expand, {
    minWidth : 16,
    autoScale : true,
    title : "",
    headerTooltip : 'Expand/collapse',
    defaultSortColumn: false,
    subViewFactory: IterationRowController.prototype.toggleFactory
  });

  config.addColumnConfiguration(IterationRowController.columnIndices.name, {
    minWidth : 280,
    autoScale : true,
    title : "Name",
    headerTooltip : 'Iteration name',
    get : IterationModel.prototype.getName,
    sortCallback: DynamicsComparators.valueComparatorFactory(IterationModel.prototype.getName),
    defaultSortColumn: false,
    editable : true,
    dragHandle: true,
    edit : {
      editor : "Text",
      set : IterationModel.prototype.setName,
      required: true
    }
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.startDate, {
    minWidth : 80,
    autoScale : true,
    title : "Start date",
    headerTooltip : 'Start date',
    get : IterationModel.prototype.getStartDate,
    sortCallback: DynamicsComparators.valueComparatorFactory(IterationModel.prototype.getStartDate),
    decorator: DynamicsDecorators.dateTimeDecorator,
    defaultSortColumn: true,
    editable : true,
    dragHandle: true,
    edit : {
      editor : "Date",
      decorator: DynamicsDecorators.dateTimeDecorator,
      set : IterationModel.prototype.setStartDate,
      required: true,
      withTime: true
    }
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.endDate, {
    minWidth : 80,
    autoScale : true,
    title : "End date",
    headerTooltip : 'End date',
    get : IterationModel.prototype.getEndDate,
    sortCallback: DynamicsComparators.valueComparatorFactory(IterationModel.prototype.getEndDate),
    decorator: DynamicsDecorators.dateTimeDecorator,
    defaultSortColumn: false,
    editable : true,
    dragHandle: true,
    edit : {
      editor : "Date",
      decorator: DynamicsDecorators.dateTimeDecorator,
      set : IterationModel.prototype.setEndDate,
      required: true,
      withTime: true
    }
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.actions, {
    minWidth : 26,
    autoScale : true,
    title : "Edit",
    subViewFactory : IterationRowController.prototype.iterationActionFactory
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.description, {
    fullWidth : true,
    visible : false,
    get : IterationModel.prototype.getDescription,
    editable : true,
    edit : {
      editor : "Wysiwyg",
      set : IterationModel.prototype.setDescription
    }
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.buttons, {
    fullWidth : true,
    visible : false,
    subViewFactory : DynamicsButtons.commonButtonFactory
  });
  config.addColumnConfiguration(IterationRowController.columnIndices.storiesData, {
    fullWidth : true,
    visible : false,
    subViewFactory : IterationRowController.prototype.rowContentsFactory,
    delayedRender: true
  });
};



/**
 * Initialize configuration for story lists.
 */
ProjectController.prototype.initializeStoryConfig = function() {
  var config = new DynamicTableConfiguration( {
    rowControllerFactory : ProjectController.prototype.storyControllerFactory,
    dataSource : ProjectModel.prototype.getLeafStories,
    cssClass: "project-story-table",
    caption : "Leaf stories"
  });

  config.addCaptionItem( {
    name : "createStory",
    text : "Create story",
    cssClass : "create",
    callback : ProjectController.prototype.createStory
  });
  
  config.addColumnConfiguration(StoryController.columnIndices.priority, {
    minWidth : 24,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "#",
    headerTooltip : 'Priority',
    sortCallback: DynamicsComparators.valueComparatorFactory(StoryModel.prototype.getRank),
    defaultSortColumn: true,
    subViewFactory : StoryController.prototype.descriptionToggleFactory
  });
  config.addColumnConfiguration(StoryController.columnIndices.name, {
    minWidth : 280,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "Name",
    headerTooltip : 'Story name',
    get : StoryModel.prototype.getName,
    sortCallback: DynamicsComparators.valueComparatorFactory(StoryModel.prototype.getName),
    editable : true,
    edit : {
      editor : "Text",
      set : StoryModel.prototype.setName,
      required: true
    }
  });
  config.addColumnConfiguration(StoryController.columnIndices.points, {
    minWidth : 50,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "Points",
    headerTooltip : 'Estimate in story points',
    get : StoryModel.prototype.getStoryPoints,
    sortCallback: DynamicsComparators.valueComparatorFactory(StoryModel.prototype.getStoryPoints),
    editable : true,
    editableCallback: StoryController.prototype.storyPointsEditable,
    edit : {
      editor : "Estimate",
      set : StoryModel.prototype.setStoryPoints
    }
  });
  config.addColumnConfiguration(StoryController.columnIndices.state, {
    minWidth : 70,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "State",
    headerTooltip : 'Story state',
    get : StoryModel.prototype.getState,
    decorator: DynamicsDecorators.stateColorDecorator,
    editable : true,
    edit : {
      editor : "Selection",
      set : StoryModel.prototype.setState,
      items : DynamicsDecorators.stateOptions
    }
  });
  config.addColumnConfiguration(StoryController.columnIndices.responsibles, {
    minWidth : 60,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "Responsibles",
    headerTooltip : 'Story responsibles',
    get : StoryModel.prototype.getResponsibles,
    decorator: DynamicsDecorators.userInitialsListDecorator,
    editable : true,
    openOnRowEdit: false,
    edit : {
      editor : "Autocomplete",
      dialogTitle: "Select users",
      dataType: "usersAndTeams",
      set : StoryModel.prototype.setResponsibles
    }
  });
  config.addColumnConfiguration(StoryController.columnIndices.actions, {
    minWidth : 26,
    autoScale : true,
    cssClass : 'projectstory-row',
    title : "Edit",
    subViewFactory : StoryController.prototype.storyActionFactory
  });
  config.addColumnConfiguration(StoryController.columnIndices.description, {
    fullWidth : true,
    visible : false,
    get : StoryModel.prototype.getDescription,
    cssClass : 'projectstory-data',
    editable : true,
    edit : {
      editor : "Wysiwyg",
      set : StoryModel.prototype.setDescription
    }
  });
  config.addColumnConfiguration(StoryController.columnIndices.buttons, {
    fullWidth : true,
    visible : false,
    cssClass : 'projectstory-data',
    subViewFactory : DynamicsButtons.commonButtonFactory
  });

  this.storyListConfig = config;
};
