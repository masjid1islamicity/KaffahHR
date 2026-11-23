import React, { useState } from 'react';

interface AvatarWithFallbackProps {
  src?: string;
  name: string;
  sizeClass?: string;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  name,
  sizeClass = 'h-9 w-9',
}) => {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (!src || failed) {
    return (
      <div
        aria-label={name}
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200`}
      >
        {initials || 'KH'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700`}
    />
  );
};
