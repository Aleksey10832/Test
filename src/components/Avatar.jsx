function initials(name) {
  const clean = (name || '').replace(/[^\p{L}\p{N} ]/gu, ' ').trim();
  if (!clean) return '#';
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0].toUpperCase()).join('');
}

function avatarColor(seed) {
  const value = String(seed || '');
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 62% 52%)`;
}

export default function Avatar({ name, size = 48 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: avatarColor(name),
      }}
    >
      {initials(name)}
    </div>
  );
}
