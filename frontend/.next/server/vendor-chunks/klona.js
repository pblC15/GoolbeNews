"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/klona";
exports.ids = ["vendor-chunks/klona"];
exports.modules = {

/***/ "(ssr)/./node_modules/klona/json/index.mjs":
/*!*******************************************!*\
  !*** ./node_modules/klona/json/index.mjs ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   klona: () => (/* binding */ klona)\n/* harmony export */ });\nfunction klona(val) {\n\tvar k, out, tmp;\n\n\tif (Array.isArray(val)) {\n\t\tout = Array(k=val.length);\n\t\twhile (k--) out[k] = (tmp=val[k]) && typeof tmp === 'object' ? klona(tmp) : tmp;\n\t\treturn out;\n\t}\n\n\tif (Object.prototype.toString.call(val) === '[object Object]') {\n\t\tout = {}; // null\n\t\tfor (k in val) {\n\t\t\tif (k === '__proto__') {\n\t\t\t\tObject.defineProperty(out, k, {\n\t\t\t\t\tvalue: klona(val[k]),\n\t\t\t\t\tconfigurable: true,\n\t\t\t\t\tenumerable: true,\n\t\t\t\t\twritable: true,\n\t\t\t\t});\n\t\t\t} else {\n\t\t\t\tout[k] = (tmp=val[k]) && typeof tmp === 'object' ? klona(tmp) : tmp;\n\t\t\t}\n\t\t}\n\t\treturn out;\n\t}\n\n\treturn val;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMva2xvbmEvanNvbi9pbmRleC5tanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJFOlxcQkFDS1VQXFxEb2N1bWVudHNcXHByb2pldG9zXFxuZXdzLXNpdGVcXGZyb250ZW5kXFxub2RlX21vZHVsZXNcXGtsb25hXFxqc29uXFxpbmRleC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGtsb25hKHZhbCkge1xuXHR2YXIgaywgb3V0LCB0bXA7XG5cblx0aWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuXHRcdG91dCA9IEFycmF5KGs9dmFsLmxlbmd0aCk7XG5cdFx0d2hpbGUgKGstLSkgb3V0W2tdID0gKHRtcD12YWxba10pICYmIHR5cGVvZiB0bXAgPT09ICdvYmplY3QnID8ga2xvbmEodG1wKSA6IHRtcDtcblx0XHRyZXR1cm4gb3V0O1xuXHR9XG5cblx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBPYmplY3RdJykge1xuXHRcdG91dCA9IHt9OyAvLyBudWxsXG5cdFx0Zm9yIChrIGluIHZhbCkge1xuXHRcdFx0aWYgKGsgPT09ICdfX3Byb3RvX18nKSB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvdXQsIGssIHtcblx0XHRcdFx0XHR2YWx1ZToga2xvbmEodmFsW2tdKSxcblx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHR3cml0YWJsZTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRba10gPSAodG1wPXZhbFtrXSkgJiYgdHlwZW9mIHRtcCA9PT0gJ29iamVjdCcgPyBrbG9uYSh0bXApIDogdG1wO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0O1xuXHR9XG5cblx0cmV0dXJuIHZhbDtcbn1cbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/klona/json/index.mjs\n");

/***/ })

};
;