/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _views_paper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./views/paper */ \"./src/views/paper.js\");\n\nvar supportedAPI = ['paper']; // enlist all methods supported by API (e.g. `orkgw('event', 'user-login');`)\n\n/**\n    The main entry of the application\n*/\n\nfunction app(window) {\n  // all methods that were called till now and stored in queue\n  // needs to be called now\n  var globalObject = window[window['ORKG-Widget']];\n  var queue = globalObject.q;\n\n  if (queue) {\n    for (var i = 0; i < queue.length; i++) {\n      apiHandler(queue[i][0], queue[i][1]);\n    }\n  } // override temporary (until the app loaded) handler\n  // for widget's API calls\n\n\n  globalObject = apiHandler;\n}\n/**\n    Method that handles all API calls\n*/\n\n\nfunction apiHandler(api, params) {\n  if (!api) {\n    throw Error('API method required');\n  }\n\n  api = api.toLowerCase();\n\n  if (supportedAPI.indexOf(api) === -1) {\n    throw Error(\"Method \".concat(api, \" is not supported\"));\n  }\n\n  switch (api) {\n    case 'paper':\n      (0,_views_paper__WEBPACK_IMPORTED_MODULE_0__.show)(params);\n      break;\n\n    default:\n      console.warn(\"No handler defined for \".concat(api));\n  }\n}\n\napp(window);\n\n//# sourceURL=webpack://orkg-widget/./src/main.js?");

/***/ }),

/***/ "./src/views/paper.js":
/*!****************************!*\
  !*** ./src/views/paper.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"getPaperByDoi\": function() { return /* binding */ getPaperByDoi; },\n/* harmony export */   \"show\": function() { return /* binding */ show; }\n/* harmony export */ });\n/* harmony import */ var _paper_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./paper.html */ \"./src/views/paper.html\");\n/* harmony import */ var _paper_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./paper.css */ \"./src/views/paper.css\");\n/* harmony import */ var _logo_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./logo.png */ \"./src/views/logo.png\");\n\n\n\nvar dictionary = {\n  add: {\n    de: 'Artikel zu ORKG hinzufügen',\n    en: 'Add paper to ORKG'\n  },\n  open: {\n    de: 'In ORKG öffnen',\n    en: 'Open in ORKG'\n  },\n  numStatements: {\n    de: 'Anzahl der Aussagen',\n    en: 'Number of statements'\n  }\n};\nvar getPaperByDoi = function getPaperByDoi(doi) {\n  // http://localhost:8000/api/widgets/?doi=10.1007/s00799-015-0158-y\n  var url = \"http://localhost:8000/api/\" + 'widgets/?doi=' + doi;\n  return new Promise(function (resolve, reject) {\n    fetch(url).then(function (response) {\n      if (!response.ok) {\n        reject({\n          error: new Error(\"Error response. (\".concat(response.status, \") \").concat(response.statusText)),\n          statusCode: response.status,\n          statusText: response.statusText\n        });\n      } else {\n        var json = response.json();\n\n        if (json.then) {\n          json.then(resolve)[\"catch\"](reject);\n        } else {\n          return resolve(json);\n        }\n      }\n    })[\"catch\"](reject);\n  });\n};\nfunction show(params) {\n  var locations = document.getElementsByClassName('orkg-widget');\n\n  var _loop = function _loop(i) {\n    // convert plain HTML string into DOM elements\n    var temporary = document.createElement('div');\n    temporary.innerHTML = _paper_html__WEBPACK_IMPORTED_MODULE_0__.default; // ORKG Logo\n\n    temporary.getElementsByClassName('orkg-widget-icon')[0].src = _logo_png__WEBPACK_IMPORTED_MODULE_2__.default; // append elements to body\n\n    var ORKGWidget = locations[i]; // Paper DOI\n\n    var doi = ORKGWidget.getAttribute('data-doi');\n    getPaperByDoi(doi).then(function (result) {\n      temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['open'][params.language];\n      temporary.getElementsByClassName('orkg-widget-text-statements')[0].textContent = dictionary['numStatements'][params.language];\n      temporary.getElementsByClassName('orkg-widget-statements')[0].textContent = result.num_statements;\n      temporary.getElementsByClassName('orkg-widget-link')[0].href = \"http://localhost:3000/\" + 'paper/' + result.id;\n\n      while (temporary.children.length > 0) {\n        ORKGWidget.appendChild(temporary.children[0]);\n      }\n    })[\"catch\"](function (error) {\n      temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['add'][params.language];\n      temporary.getElementsByClassName('orkg-widget-link')[0].href = \"http://localhost:3000/\" + 'add-paper?entry=' + doi;\n      var elem = temporary.getElementsByClassName('orkg-widget-description')[0];\n      elem.parentNode.removeChild(elem);\n\n      while (temporary.children.length > 0) {\n        ORKGWidget.appendChild(temporary.children[0]);\n      }\n    });\n  };\n\n  for (var i = 0; i < locations.length; i++) {\n    _loop(i);\n  }\n}\n\n//# sourceURL=webpack://orkg-widget/./src/views/paper.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/views/paper.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/views/paper.css ***!
  \*******************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ \"./node_modules/css-loader/dist/runtime/cssWithMappingToString.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".orkg-widget-box {\\n    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\\n    border: 1px solid rgb(232, 97, 97);\\n}\\n.orkg-widget-link {\\n    color: #fff;\\n    background-color: rgb(232, 97, 97);\\n    border-color: rgb(232, 97, 97);\\n    padding: 6px 12px;\\n    display: block;\\n    margin-bottom: 0 !important;\\n    font-size: 14px;\\n    font-weight: 400;\\n    line-height: 1.42857143;\\n    text-align: center;\\n    white-space: nowrap;\\n    touch-action: manipulation;\\n    cursor: pointer;\\n    user-select: none;\\n    background-image: none;\\n    border: 1px solid transparent;\\n    text-decoration: none;\\n}\\n.orkg-widget-link:hover,\\n.orkg-widget-link:focus {\\n    color: #fff;\\n    background-color: #e34040;\\n    border-color: #e23434;\\n}\\n.orkg-widget-description {\\n    padding: 5px;\\n}\\n.orkg-widget-label {\\n    position: relative;\\n    left: -3px;\\n    text-align: left;\\n    display: inline-block;\\n    background: transparent;\\n}\\n.orkg-widget-icon {\\n    width: 24px;\\n    vertical-align: middle;\\n}\\n.orkg-widget-statements {\\n    float: right;\\n    font-weight: bold;\\n}\\n\", \"\",{\"version\":3,\"sources\":[\"webpack://./src/views/paper.css\"],\"names\":[],\"mappings\":\"AAAA;IACI,2DAA2D;IAC3D,kCAAkC;AACtC;AACA;IACI,WAAW;IACX,kCAAkC;IAClC,8BAA8B;IAC9B,iBAAiB;IACjB,cAAc;IACd,2BAA2B;IAC3B,eAAe;IACf,gBAAgB;IAChB,uBAAuB;IACvB,kBAAkB;IAClB,mBAAmB;IACnB,0BAA0B;IAC1B,eAAe;IACf,iBAAiB;IACjB,sBAAsB;IACtB,6BAA6B;IAC7B,qBAAqB;AACzB;AACA;;IAEI,WAAW;IACX,yBAAyB;IACzB,qBAAqB;AACzB;AACA;IACI,YAAY;AAChB;AACA;IACI,kBAAkB;IAClB,UAAU;IACV,gBAAgB;IAChB,qBAAqB;IACrB,uBAAuB;AAC3B;AACA;IACI,WAAW;IACX,sBAAsB;AAC1B;AACA;IACI,YAAY;IACZ,iBAAiB;AACrB\",\"sourcesContent\":[\".orkg-widget-box {\\n    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\\n    border: 1px solid rgb(232, 97, 97);\\n}\\n.orkg-widget-link {\\n    color: #fff;\\n    background-color: rgb(232, 97, 97);\\n    border-color: rgb(232, 97, 97);\\n    padding: 6px 12px;\\n    display: block;\\n    margin-bottom: 0 !important;\\n    font-size: 14px;\\n    font-weight: 400;\\n    line-height: 1.42857143;\\n    text-align: center;\\n    white-space: nowrap;\\n    touch-action: manipulation;\\n    cursor: pointer;\\n    user-select: none;\\n    background-image: none;\\n    border: 1px solid transparent;\\n    text-decoration: none;\\n}\\n.orkg-widget-link:hover,\\n.orkg-widget-link:focus {\\n    color: #fff;\\n    background-color: #e34040;\\n    border-color: #e23434;\\n}\\n.orkg-widget-description {\\n    padding: 5px;\\n}\\n.orkg-widget-label {\\n    position: relative;\\n    left: -3px;\\n    text-align: left;\\n    display: inline-block;\\n    background: transparent;\\n}\\n.orkg-widget-icon {\\n    width: 24px;\\n    vertical-align: middle;\\n}\\n.orkg-widget-statements {\\n    float: right;\\n    font-weight: bold;\\n}\\n\"],\"sourceRoot\":\"\"}]);\n// Exports\n/* harmony default export */ __webpack_exports__[\"default\"] = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://orkg-widget/./src/views/paper.css?./node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module) {

eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://orkg-widget/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ (function(module) {

eval("\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArrayLimit(arr, i) { if (typeof Symbol === \"undefined\" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nmodule.exports = function cssWithMappingToString(item) {\n  var _item = _slicedToArray(item, 4),\n      content = _item[1],\n      cssMapping = _item[3];\n\n  if (typeof btoa === \"function\") {\n    // eslint-disable-next-line no-undef\n    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));\n    var data = \"sourceMappingURL=data:application/json;charset=utf-8;base64,\".concat(base64);\n    var sourceMapping = \"/*# \".concat(data, \" */\");\n    var sourceURLs = cssMapping.sources.map(function (source) {\n      return \"/*# sourceURL=\".concat(cssMapping.sourceRoot || \"\").concat(source, \" */\");\n    });\n    return [content].concat(sourceURLs).concat([sourceMapping]).join(\"\\n\");\n  }\n\n  return [content].join(\"\\n\");\n};\n\n//# sourceURL=webpack://orkg-widget/./node_modules/css-loader/dist/runtime/cssWithMappingToString.js?");

/***/ }),

/***/ "./src/views/paper.html":
/*!******************************!*\
  !*** ./src/views/paper.html ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n// Module\nvar code = \"<div class=\\\"orkg-widget-box\\\">\\n    <a href=\\\"#\\\" class=\\\"orkg-widget-link\\\" target=\\\"_blank\\\">\\n        <span class=\\\"orkg-widget-label\\\">\\n            <img src=\\\"#\\\" class=\\\"orkg-widget-icon\\\" />\\n            <span class=\\\"orkg-widget-txt-link\\\">Open in ORKG</span>\\n        </span>\\n    </a>\\n    <div class=\\\"orkg-widget-description\\\">\\n        <span class=\\\"orkg-widget-text-statements\\\">Number of statements</span>\\n        <span class=\\\"orkg-widget-statements\\\">0</span>\\n    </div>\\n</div>\\n\";\n// Exports\n/* harmony default export */ __webpack_exports__[\"default\"] = (code);\n\n//# sourceURL=webpack://orkg-widget/./src/views/paper.html?");

/***/ }),

/***/ "./src/views/paper.css":
/*!*****************************!*\
  !*** ./src/views/paper.css ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_paper_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./paper.css */ \"./node_modules/css-loader/dist/cjs.js!./src/views/paper.css\");\n\n            \n\nvar options = {};\n\noptions.insert = \"head\";\noptions.singleton = false;\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_paper_css__WEBPACK_IMPORTED_MODULE_1__.default, options);\n\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (_node_modules_css_loader_dist_cjs_js_paper_css__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});\n\n//# sourceURL=webpack://orkg-widget/./src/views/paper.css?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval("\n\nvar isOldIE = function isOldIE() {\n  var memo;\n  return function memorize() {\n    if (typeof memo === 'undefined') {\n      // Test for IE <= 9 as proposed by Browserhacks\n      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805\n      // Tests for existence of standard globals is to allow style-loader\n      // to operate correctly into non-standard environments\n      // @see https://github.com/webpack-contrib/style-loader/issues/177\n      memo = Boolean(window && document && document.all && !window.atob);\n    }\n\n    return memo;\n  };\n}();\n\nvar getTarget = function getTarget() {\n  var memo = {};\n  return function memorize(target) {\n    if (typeof memo[target] === 'undefined') {\n      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself\n\n      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n        try {\n          // This will throw an exception if access to iframe is blocked\n          // due to cross-origin restrictions\n          styleTarget = styleTarget.contentDocument.head;\n        } catch (e) {\n          // istanbul ignore next\n          styleTarget = null;\n        }\n      }\n\n      memo[target] = styleTarget;\n    }\n\n    return memo[target];\n  };\n}();\n\nvar stylesInDom = [];\n\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n\n  for (var i = 0; i < stylesInDom.length; i++) {\n    if (stylesInDom[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n\n  return result;\n}\n\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var index = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3]\n    };\n\n    if (index !== -1) {\n      stylesInDom[index].references++;\n      stylesInDom[index].updater(obj);\n    } else {\n      stylesInDom.push({\n        identifier: identifier,\n        updater: addStyle(obj, options),\n        references: 1\n      });\n    }\n\n    identifiers.push(identifier);\n  }\n\n  return identifiers;\n}\n\nfunction insertStyleElement(options) {\n  var style = document.createElement('style');\n  var attributes = options.attributes || {};\n\n  if (typeof attributes.nonce === 'undefined') {\n    var nonce =  true ? __webpack_require__.nc : 0;\n\n    if (nonce) {\n      attributes.nonce = nonce;\n    }\n  }\n\n  Object.keys(attributes).forEach(function (key) {\n    style.setAttribute(key, attributes[key]);\n  });\n\n  if (typeof options.insert === 'function') {\n    options.insert(style);\n  } else {\n    var target = getTarget(options.insert || 'head');\n\n    if (!target) {\n      throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n    }\n\n    target.appendChild(style);\n  }\n\n  return style;\n}\n\nfunction removeStyleElement(style) {\n  // istanbul ignore if\n  if (style.parentNode === null) {\n    return false;\n  }\n\n  style.parentNode.removeChild(style);\n}\n/* istanbul ignore next  */\n\n\nvar replaceText = function replaceText() {\n  var textStore = [];\n  return function replace(index, replacement) {\n    textStore[index] = replacement;\n    return textStore.filter(Boolean).join('\\n');\n  };\n}();\n\nfunction applyToSingletonTag(style, index, remove, obj) {\n  var css = remove ? '' : obj.media ? \"@media \".concat(obj.media, \" {\").concat(obj.css, \"}\") : obj.css; // For old IE\n\n  /* istanbul ignore if  */\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = replaceText(index, css);\n  } else {\n    var cssNode = document.createTextNode(css);\n    var childNodes = style.childNodes;\n\n    if (childNodes[index]) {\n      style.removeChild(childNodes[index]);\n    }\n\n    if (childNodes.length) {\n      style.insertBefore(cssNode, childNodes[index]);\n    } else {\n      style.appendChild(cssNode);\n    }\n  }\n}\n\nfunction applyToTag(style, options, obj) {\n  var css = obj.css;\n  var media = obj.media;\n  var sourceMap = obj.sourceMap;\n\n  if (media) {\n    style.setAttribute('media', media);\n  } else {\n    style.removeAttribute('media');\n  }\n\n  if (sourceMap && typeof btoa !== 'undefined') {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  } // For old IE\n\n  /* istanbul ignore if  */\n\n\n  if (style.styleSheet) {\n    style.styleSheet.cssText = css;\n  } else {\n    while (style.firstChild) {\n      style.removeChild(style.firstChild);\n    }\n\n    style.appendChild(document.createTextNode(css));\n  }\n}\n\nvar singleton = null;\nvar singletonCounter = 0;\n\nfunction addStyle(obj, options) {\n  var style;\n  var update;\n  var remove;\n\n  if (options.singleton) {\n    var styleIndex = singletonCounter++;\n    style = singleton || (singleton = insertStyleElement(options));\n    update = applyToSingletonTag.bind(null, style, styleIndex, false);\n    remove = applyToSingletonTag.bind(null, style, styleIndex, true);\n  } else {\n    style = insertStyleElement(options);\n    update = applyToTag.bind(null, style, options);\n\n    remove = function remove() {\n      removeStyleElement(style);\n    };\n  }\n\n  update(obj);\n  return function updateStyle(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {\n        return;\n      }\n\n      update(obj = newObj);\n    } else {\n      remove();\n    }\n  };\n}\n\nmodule.exports = function (list, options) {\n  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>\n  // tags it will allow on a page\n\n  if (!options.singleton && typeof options.singleton !== 'boolean') {\n    options.singleton = isOldIE();\n  }\n\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n\n    if (Object.prototype.toString.call(newList) !== '[object Array]') {\n      return;\n    }\n\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDom[index].references--;\n    }\n\n    var newLastIdentifiers = modulesToDom(newList, options);\n\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n\n      var _index = getIndexByIdentifier(_identifier);\n\n      if (stylesInDom[_index].references === 0) {\n        stylesInDom[_index].updater();\n\n        stylesInDom.splice(_index, 1);\n      }\n    }\n\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://orkg-widget/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./src/views/logo.png":
/*!****************************!*\
  !*** ./src/views/logo.png ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAMAAADfNcjQAAAArlBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8tivQqAAAAOXRSTlMABAf6EfcL1oE7xDYYWu/ib5R8VElA5si4l4+JdBzrv08z8d7OsqydhGNeRjArJiHboHgVD6i6Z6J3b8ivAAACPElEQVQ4y3VUB5KjQAwUOWewiY7rnNfe2+v/f+zEDK7yVdmiCmZoqdXSCOjFFMosRDt+vjeFfoHxCC0pH3APWkD6Gs4nDhcNQ4r19Z5ACRDqjNMcxXuKY2PLVOW6J1J4Ofg9zqeLrqQ/sSIdnEh9DfRKDcDeBlCR5B576nxXr9w/rUnkwFgnm+nc0gxtpD8Er53Os9xxcnti+TS29KEEDWUe2R27OA1J042Kwm9SFY46jRfW6QZMGp/MVGpUyb3SuJZ5dccz6ZJGwKilgykZ1IlLe0tKz7H0eeFvQ8DNht7u0bLkGSl8BZiYoojzD6DZQqw+CjnoOFaZi2JYQxtodgWmR15OkVIfa/PNrPE8Ao7cAIUTXG5XlYTHgQ7FFq6AJUkc/LLauS/3rGxLNqYSHkg0GFjTkDW5EaVwXx3u0AyUpIjNX5dvrdTw1FnYwKLwxa4JTa5iJ6uQeArDy749O+oblsHra56BdxL2XOBrTvSYoCbSFxvRKA9GJ+B7bQCJ2p+EoxknatAJ4gvCM8NmHAHX2ZCrQkLhIF51nDt1scXaav05k2dtSbjxcfehm3CU7QCtdES0MBppZCwvwvkbgHGM1p6at7n+nGPNIhvGqqqmQcIjB1E4ndLyTxVnOb/DjEMnYFsdACxNmdw858nXAoB7ELNU7HeZQ/tV3Q3igp5I7brHUMzT4mQY1abv3AsoBSvmEp7oWRuT8vbrLlD2/fOt+6f/wwYx57bsj78QdYUfO5p+xJlkGxrV//A/nMo2F7Pql/EAAAAASUVORK5CYII=\");\n\n//# sourceURL=webpack://orkg-widget/./src/views/logo.png?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQUFBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBLGNBQWMsMEJBQTBCLEVBQUU7V0FDMUMsY0FBYyxlQUFlO1dBQzdCLGdDQUFnQyxZQUFZO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsNkNBQTZDLHdEQUF3RCxFOzs7OztXQ0FyRztXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7VUNOQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJ3aWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcblx0XHRmdW5jdGlvbigpIHsgcmV0dXJuIG1vZHVsZTsgfTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBjYW4ndCBiZSBpbmxpbmVkIGJlY2F1c2UgdGhlIGV2YWwgZGV2dG9vbCBpcyB1c2VkLlxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvbWFpbi5qc1wiKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=