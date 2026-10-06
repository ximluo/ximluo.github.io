/* Facts about the device and viewport, read the way the site needs them: once for media queries that do not
   change during a visit, and live for the phone layout, which flips with the window width. */

export const RM = matchMedia("(prefers-reduced-motion: reduce)").matches
export const TOUCH = matchMedia("(hover: none)").matches

/** The phone layout, shared with the 760px breakpoint in the stylesheets. */
export const isPhone = () => innerWidth <= 760

/** Touch devices and the phone layout both get the phone's gestures and sheet sizes. */
export const isHandheld = () => isPhone() || TOUCH
