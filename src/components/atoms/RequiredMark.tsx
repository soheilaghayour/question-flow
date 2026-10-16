export function RequiredMark() {
  // aria-hidden: the accessible name must stay the plain label text; the
  // required state reaches screen readers via aria-required instead.
  return (
    <span aria-hidden="true" className="text-error">
      *
    </span>
  )
}
