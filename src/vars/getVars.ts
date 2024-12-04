import vars from './vars';

export function getVars(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let result: any = vars;

  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return path; // 若找不到則回傳 path 本身
  }

  if (params) {
    return Object.keys(params).reduce(
      (str, param) => str.replace(`{${param}}`, String(params[param])),
      result
    );
  }

  return result;
}
