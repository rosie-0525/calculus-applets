/** A number to one decimal place, without a trailing ".0" or a "-0". */
export const fmt = (x) => {
  const t = (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, '');
  return t === '-0' ? '0' : t;
};

/**
 * A labelled range slider for an on-slide parameter. `name` is plain text for
 * screen readers; `label`, if given, is what is shown (e.g. a <Tex>); `format`
 * turns the value into the text shown next to the slider. It lets go of focus when
 * released, so the presenter's arrow keys go back to reveal.js instead of
 * nudging the slider.
 */
export default function Slider({
  name,
  label = name,
  value,
  onChange,
  color,
  min = -1.5,
  max = 1.5,
  step = 0.1,
  format = fmt,
}) {
  return (
    <label className="lc-slider" data-prevent-swipe>
      <span className="lc-name" style={{ color }}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => e.currentTarget.blur()}
        style={{ accentColor: color }}
        aria-label={name}
      />
      <span className="lc-value">{format(value)}</span>
    </label>
  );
}
