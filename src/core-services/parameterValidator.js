function checkProperty(data, p) {
  if (!data[p] || data[p] === undefined || data[p] == null) {
    throw new Error(`Missing parameter '${p}' `);
  }
}

function checkNestedProperty(data, nested) {
  checkProperty(data, nested[0]);

  if (nested.length > 1) checkNestedProperty(data[nested[0]], nested.slice(1));
}

module.exports = (data, params) => {
  for (const p of params) checkNestedProperty(data, p.split('.'));
  return data;
};
