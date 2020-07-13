// Add paper

export const UPDATE_GENERAL_DATA = 'UPDATE_GENERAL_DATA';
export const ADD_PAPER_NEXT_STEP = 'ADD_PAPER_NEXT_STEP';
export const ADD_PAPER_PREVIOUS_STEP = 'ADD_PAPER_PREVIOUS_STEP';
export const ADD_PAPER_BLOCK_NAVIGATION = 'ADD_PAPER_BLOCK_NAVIGATION';
export const ADD_PAPER_UNBLOCK_NAVIGATION = 'ADD_PAPER_UNBLOCK_NAVIGATION';
export const UPDATE_RESEARCH_FIELD = 'UPDATE_RESEARCH_FIELD';
export const CREATE_CONTRIBUTION = 'CREATE_CONTRIBUTION';
export const DELETE_CONTRIBUTION = 'DELETE_CONTRIBUTION';
export const SELECT_CONTRIBUTION = 'SELECT_CONTRIBUTION';
export const UPDATE_CONTRIBUTION_LABEL = 'UPDATE_CONTRIBUTION_LABEL';
export const UPDATE_RESEARCH_PROBLEMS = 'UPDATE_RESEARCH_PROBLEMS';
export const UPDATE_ABSTRACT = 'UPDATE_ABSTRACT';
export const CREATE_ANNOTATION = 'CREATE_ANNOTATION';
export const REMOVE_ANNOTATION = 'REMOVE_ANNOTATION';
export const VALIDATE_ANNOTATION = 'VALIDATE_ANNOTATION';
export const TOGGLE_EDIT_ANNOTATION = 'TOGGLE_EDIT_ANNOTATION';
export const UPDATE_ANNOTATION_CLASS = 'UPDATE_ANNOTATION_CLASS';
export const CLEAR_ANNOTATIONS = 'CLEAR_ANNOTATIONS';
export const TOGGLE_ABSTRACT_DIALOG = 'TOGGLE_ABSTRACT_DIALOG';
export const SET_ABSTRACT_DIALOG_VIEW = 'SET_ABSTRACT_DIALOG_VIEW';
export const ADD_PAPER_LOAD_DATA = 'ADD_PAPER_LOAD_DATA';

export const CLOSE_TOUR = 'CLOSE_TOUR';
export const OPEN_TOUR = 'OPEN_TOUR';

export const CREATE_RESOURCE = 'CREATE_RESOURCE';
export const DELETE_RESOURCE = 'DELETE_RESOURCE';
export const CREATE_PROPERTY = 'CREATE_PROPERTY';
export const DELETE_PROPERTY = 'DELETE_PROPERTY';
export const CREATE_VALUE = 'CREATE_VALUE';
export const DELETE_VALUE = 'DELETE_VALUE';
export const TOGGLE_EDIT_PROPERTY_LABEL = 'TOGGLE_EDIT_PROPERTY_LABEL';
export const UPDATE_PROPERTY_LABEL = 'UPDATE_PROPERTY_LABEL';
export const CHANGE_PROPERTY = 'CHANGE_PROPERTY';
export const DONE_ANIMATION = 'DONE_ANIMATION';
export const IS_SAVING_PROPERTY = 'IS_SAVING_PROPERTY';
export const DONE_SAVING_PROPERTY = 'DONE_SAVING_PROPERTY';
export const TOGGLE_EDIT_VALUE = 'TOGGLE_EDIT_VALUE';
export const UPDATE_VALUE_LABEL = 'UPDATE_VALUE_LABEL';
export const CHANGE_VALUE = 'CHANGE_VALUE';
export const UPDATE_RESOURCE_CLASSES = 'UPDATE_RESOURCE_CLASSES';
export const IS_SAVING_VALUE = 'IS_SAVING_VALUE';
export const DONE_SAVING_VALUE = 'DONE_SAVING_VALUE';
export const STATEMENT_BROWSER_LOAD_DATA = 'STATEMENT_BROWSER_LOAD_DATA';

export const SELECT_RESOURCE = 'SELECT_RESOURCE';
export const ADD_RESOURCE_HISTORY = 'ADD_RESOURCE_HISTORY';
export const GOTO_RESOURCE_HISTORY = 'GOTO_RESOURCE_HISTORY';
export const CLEAR_RESOURCE_HISTORY = 'CLEAR_RESOURCE_HISTORY';
export const CLEAR_SELECTED_PROPERTY = 'CLEAR_SELECTED_PROPERTY';
export const ADD_FETCHED_STATEMENT = 'ADD_FETCHED_STATEMENT';
export const SET_STATEMENT_IS_FECHTED = 'SET_STATEMENT_IS_FECHTED';
export const SAVE_ADD_PAPER = 'SAVE_ADD_PAPER';
export const SET_RESEARCH_PROBLEMS = 'SET_RESEARCH_PROBLEMS';
export const SET_PAPER_AUTHORS = 'SET_PAPER_AUTHORS';
export const IS_FETCHING_STATEMENTS = 'IS_FETCHING_STATEMENTS';
export const DONE_FETCHING_STATEMENTS = 'DONE_FETCHING_STATEMENTS';
export const RESET_LEVEL = 'RESET_LEVEL';
export const RESET_STATEMENT_BROWSER = 'RESET_STATEMENT_BROWSER';

export const ADD_TO_COMPARISON = 'ADD_TO_COMPARISON';
export const REMOVE_FROM_COMPARISON = 'REMOVE_FROM_COMPARISON';
export const LOAD_COMPARISON_FROM_LOCAL_STORAGE = 'LOAD_COMPARISON_FROM_LOCAL_STORAGE';

export const UPDATE_AUTH = 'UPDATE_AUTH';
export const RESET_AUTH = 'RESET_AUTH';
export const TOGGLE_AUTHENTICATION_DIALOG = 'TOGGLE_AUTHENTICATION_DIALOG';
export const OPEN_AUTHENTICATION_DIALOG = 'OPEN_AUTHENTICATION_DIALOG';
export const LOAD_PAPER = 'LOAD_PAPER';

// PDF annotation
export const PDF_ANNOTATION_SELECT_TOOL = 'PDF_ANNOTATION_SELECT_TOOL';
export const PDF_ANNOTATION_SET_TABLE_DATA = 'PDF_ANNOTATION_SET_TABLE_DATA';
export const PDF_ANNOTATION_UPDATE_TABLE_DATA = 'PDF_ANNOTATION_UPDATE_TABLE_DATA';
export const PDF_ANNOTATION_SET_LABEL_CACHE = 'PDF_ANNOTATION_SET_LABEL_CACHE';
export const PDF_ANNOTATION_SET_TABLE_REGION = 'PDF_ANNOTATION_SET_TABLE_REGION';
export const PDF_ANNOTATION_DELETE_TABLE_REGION = 'PDF_ANNOTATION_DELETE_TABLE_REGION';
export const PDF_ANNOTATION_FETCH_PDF_PARSE_REQUEST = 'PDF_ANNOTATION_FETCH_PDF_PARSE_REQUEST';
export const PDF_ANNOTATION_FETCH_PDF_PARSE_FAILURE = 'PDF_ANNOTATION_FETCH_PDF_PARSE_FAILURE';
export const PDF_ANNOTATION_FETCH_PDF_PARSE_SUCCESS = 'PDF_ANNOTATION_FETCH_PDF_PARSE_SUCCESS';
export const PDF_ANNOTATION_FETCH_PDF_CONVERT_REQUEST = 'PDF_ANNOTATION_FETCH_PDF_CONVERT_REQUEST';
export const PDF_ANNOTATION_FETCH_PDF_CONVERT_FAILURE = 'PDF_ANNOTATION_FETCH_PDF_CONVERT_FAILURE';
export const PDF_ANNOTATION_FETCH_PDF_CONVERT_SUCCESS = 'PDF_ANNOTATION_FETCH_PDF_CONVERT_SUCCESS';
export const PDF_ANNOTATION_RESET_DATA = 'PDF_ANNOTATION_RESET_DATA';

// Templates in the statementbrowser
export const STATEMENT_BROWSER_UPDATE_SETTINGS = 'STATEMENT_BROWSER_UPDATE_SETTINGS';
export const CREATE_TEMPLATE = 'CREATE_TEMPLATE';
export const IS_FETCHING_TEMPLATES_OF_CLASS = 'IS_FETCHING_TEMPLATES_OF_CLASS';
export const DONE_FETCHING_TEMPLATES_OF_CLASS = 'DONE_FETCHING_TEMPLATES_OF_CLASS';
export const IS_FETCHING_TEMPLATE_DATA = 'IS_FETCHING_TEMPLATE_DATA';
export const DONE_FETCHING_TEMPLATE_DATA = 'DONE_FETCHING_TEMPLATE_DATA';

// AddTemplate
export const TEMPLATE_SET_LABEL = 'TEMPLATE_SET_LABEL';
export const TEMPLATE_SET_PREDICATE = 'TEMPLATE_SET_PREDICATE';
export const TEMPLATE_SET_CLASS = 'TEMPLATE_SET_CLASS';
export const TEMPLATE_SET_RESEARCH_PROBLEMS = 'TEMPLATE_SET_RESEARCH_PROBLEMS';
export const TEMPLATE_SET_RESEARCH_FIELDS = 'TEMPLATE_SET_RESEARCH_FIELDS';
export const TEMPLATE_SET_EDIT_MODE = 'TEMPLATE_SET_EDIT_MODE';
export const TEMPLATE_SET_IS_STRICT = 'TEMPLATE_SET_IS_STRICT';
export const TEMPLATE_SET_HAS_LABEL_FORMAT = 'TEMPLATE_SET_HAS_LABEL_FORMAT';
export const TEMPLATE_SET_LABEL_FORMAT = 'TEMPLATE_SET_LABEL_FORMAT';
export const TEMPLATE_SET_COMPONENTS = 'TEMPLATE_SET_COMPONENTS';
export const TEMPLATE_SET_SUB_TEMPLATES = 'TEMPLATE_SET_SUB_TEMPLATES';
export const TEMPLATE_INIT = 'TEMPLATE_INIT';
export const IS_FETCHING_TEMPLATE = 'IS_FETCHING_TEMPLATE';
export const DONE_FETCHING_TEMPLATE = 'DONE_FETCHING_TEMPLATE';
export const IS_SAVING_TEMPLATE = 'IS_SAVING_TEMPLATE';
export const SAVE_TEMPLATE_DONE = 'SAVE_TEMPLATE_DONE';
