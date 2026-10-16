/** Joins the truthy class names with single spaces. */
export function cn(...classNames: (string | false | undefined)[]): string {
  return classNames.filter(Boolean).join(' ')
}
