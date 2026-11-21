/**
 * A reveal.js fragment: hidden until the presenter reaches `index`.
 * Fragments with the same index appear together.
 */
export default function Fragment({
  index,
  as: Tag = 'div',
  className = '',
  effect = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`fragment ${effect} ${className}`.replace(/\s+/g, ' ').trim()}
      data-fragment-index={index}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * An invisible fragment used purely as a CSS switch: when reveal marks it
 * `.visible`, sibling selectors in deck.css turn on the matching `data-fx`
 * decorations inside a following `.fx-host`.
 * It must be placed BEFORE the `.fx-host` element, as a sibling.
 */
export function FxMarker({ index, id }) {
  return (
    <span
      className="fragment fx-marker"
      data-fragment-index={index}
      data-fx={id}
      aria-hidden="true"
    />
  );
}
