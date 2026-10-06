/** Joins class names, dropping the falsy ones. */
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ")
