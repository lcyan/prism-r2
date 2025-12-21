export function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, [key, value]) => {
      acc[key?.trim()] = decodeURIComponent(value?.trim() || '');
      return acc;
    }, {} as Record<string, string>);
}
