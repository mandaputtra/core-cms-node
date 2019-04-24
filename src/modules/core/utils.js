import moment from 'moment';
import excel from 'node-excel-export';
import cfg from '../../../config';

/**
 * Wrap controller function
 * @param {function} fn
 */

export const wrap = (originalFunction) => {
  return (req, res, next) => {
    try {
      return originalFunction.call(this, req, res, next);
    } catch (e) {
      return next(e);
    }
  };
};

/**
 *
 * Wrapper function for config
 * @param {string} key
 * @param {*} defaultValue
 */
export function config(key, defaultValue) {
  if (cfg[key] === undefined) {
    return defaultValue;
  }

  return cfg[key];
}

export const capitalize = (str) => {
  if (!str) return '';
  if (Array.isArray(str)) return str.map(s => s.replace(/\b\w/g, l => l.toUpperCase()));
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const error = (flashType, msg, { redirect = 'back', type = 'html' } = {}) => ({ alert: flashType, msg, redirect, type });
export const errorJSON = (flashType, msg, { redirect = 'back' } = {}) => ({ alert: flashType, msg, redirect, type: 'json' });

export const formatDate = date => moment(date).format('DD/MM/YYYY');
export const formatDateInput = date => moment(date).format('YYYY-MM-DD');
export const formatDateText = date => moment(date).format('Do MMMM YYYY');

export const formatStatus = statuses => Object.keys(statuses).map(status =>
  ({ id: statuses[status], name: capitalize(status) }));

export const formatDocument = (docName) => {
  const name = docName.split('-');
  const ext = name.pop().split('.').pop();
  return `${name.join('')}.${ext}`;
};

export const reverseStatus = statuses => Object.keys(statuses).reduce((res, status) => {
  res[statuses[status]] = capitalize(status);
  return res;
}, {});

export const formatCurrency = (format, curr) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: format,
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
}).format(curr);

export const range = (qb, min, max, col) => {
  if (min && !max) qb.where(col, '>=', min);
  if (!min && max) qb.where(col, '<=', max);
  if (min && max) qb.whereBetween(col, [min, max]);
};

export const rangeDate = (qb, min, max, col) => {
  if (min) min += ' 00:00:00';
  if (max) max += ' 23:59:59';
  range(qb, min, max, col);
};

export const formatPermissions = (permissions) => {
  const colNames = ['User', 'Company', 'People', 'Deal', 'Event', 'Hiring', 'Role'];
  const action = ['add', 'edit', 'view', 'delete'];
  const master = ['status', 'category'];
  return Object.keys(permissions).reduce((res, key) => {
    let prop;
    const name = capitalize(key.toLowerCase()).split('_');
    if (colNames.includes(name[0]) && !master.includes(name[1])) prop = name[0];
    else {
      // Join master title without including action
      prop = name.reduce((title, val) => {
        if (!action.includes(val)) title = `${title} ${val}`;
        return title;
      });
      prop = capitalize(prop);
    }
    if (!Array.isArray(res[prop])) res[prop] = [];
    res[prop].push({ name: name.join(' '), id: permissions[key] });
    return res;
  }, {});
};

/**
 * Make sure data property names are the exact same as the cols list
 * @param data {object}
 * @param cols {[string]}
 * @param name {string} name of the exported document
 */
export const genReport = (data, cols, name) => {
  const style = { header: { font: { bold: true } },
    newLine: { alignment: { wrapText: true, vertical: 'center' } },
    center: { alignment: { vertical: 'center' } } };
  // Wrapped format in excel
  const wrapText = ['notes', 'documents', 'work', 'invitees', 'candidates'];
  const specification = Object.keys(data[0]).reduce((spec, key, idx) => {
    spec[key] = {
      displayName: cols[idx],
      headerStyle: style.header,
      cellStyle: wrapText.includes(key) ? style.newLine : style.center };
    return spec;
  }, {});
  return excel.buildExport([{ name, specification, data }]);
};
