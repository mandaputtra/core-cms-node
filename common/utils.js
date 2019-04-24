const utils = {};
module.exports = utils;

/**
 * Check whether passed argument is an array
 * @param {any} arr
 * @returns {boolean}
 */
utils.isArray = arr => Array.isArray(arr);

/**
 * Check whether passed argument is an array
 * @param {any} obj
 * @returns {boolean}
 */
utils.isObject = obj => !utils.isArray(obj) && (obj !== null) && (typeof obj === 'object');

/**
 * Check whether passed argument is a function
 * @param {Function} f
 * @returns {boolean}
 */
utils.isFunc = f => typeof f === 'function';
utils.isFunction = utils.isFunc;

/**
 * Check whether passed argument is a string
 * @param {String} str
 * @returns {boolean}
 */
utils.isString = str => typeof str === 'string';
