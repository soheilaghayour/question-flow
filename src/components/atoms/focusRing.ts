/** Single owner of the keyboard focus ring — every atom composes it, so a ring
 * change is a one-line edit and controls can't drift apart. */
export const FOCUS_RING =
  'focus:outline-2 focus:outline-offset-2 focus:outline-primary'
