/*
 * String formatting utilities
 * 
 *
 */


// 문자열의 첫번째 문자만 대문자, 나머지는 소문자로 변환
export function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLocaleLowerCase();
}

export function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to kebab-case
    .replace(/\s+/g, '-') // spaces to hyphens
    .toLowerCase();
}
