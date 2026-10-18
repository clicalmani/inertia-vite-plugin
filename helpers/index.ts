export const resolvePageComponent = (
  name: string,
  pages: Record<string, string>,
  extensions: string[] = [],
): string => pages[name];