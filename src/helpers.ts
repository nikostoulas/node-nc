export function compact(obj) {
  let compacted = {};
  for (let key in obj) {
    if (obj[key] !== undefined) {
      compacted[key] = obj[key];
    }
  }
  return compacted;
}

export function convertBoolean(obj) {
  let converted = {};
  for (let key in obj) {
    if (obj[key] === 'true') {
      converted[key] = true;
    } else if (obj[key] === 'false') {
      converted[key] = false;
    } else if (obj[key]) {
      converted[key] = obj[key];
    }
  }
  return converted;
}

export function uniqueKeepLatest(array) {
  let rev = array.reverse();
  rev = rev.filter((line, index) => rev.findIndex(l => l === line) === index);
  return rev.reverse();
}

export function camelCase(str: string) {
  return str.replace(/-(\w)/g, (_, w: string) => w.toUpperCase());
}

export function getRegexStrs() {
  const nameWithComma = '[^()\\n]*';
  const nameInParentheses = `(?:\\(${nameWithComma}\\))*`;
  const nameFollowedByParentheses = `\\((?:[^()\\n]|(?:${nameInParentheses}))*\\)`;

  return {
    space: '[\\t\\f\\v ]+',
    name: '[^(),\\n\\]\\[]*',
    nameWithComma,
    nameInParentheses: `(?:\\(${nameWithComma}\\))*`,
    nameFollowedByParentheses,
    nestedParentheses: `\\((?:[^()\\n]|(?:${nameInParentheses}|${nameFollowedByParentheses}))*\\)`
  };
}
