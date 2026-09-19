'use client';

import { resolveProfileStyle } from '@/lib/profile-style';
import type { BackgroundType, SocialLink } from '@/lib/types';

interface PreviewProps {
  fullName: string;
  position?: string;
  companyName?: string;
  bio?: string;
  photo?: string | null;
  theme: 'LIGHT' | 'DARK';
  photoStyle: 'COLOR' | 'BLACK_AND_WHITE';
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundTo: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  linkTitles: string[];
  socialLinks: SocialLink[];
}

export default function LivePreview(props: PreviewProps) {
  const style = resolveProfileStyle(props);

  return (
    <div className="w-full lg:w-auto lg:sticky lg:top-8 shrink-0">
      <div className="w-[280px] h-[580px] rounded-[2.5rem] border-8 border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden mx-auto">
        <div
          className="w-full h-full overflow-y-auto flex flex-col items-center gap-4 px-5 py-8"
          style={{ ...style.backgroundStyle, color: style.textColor }}
        >
          {props.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.photo}
              alt={props.fullName}
              className={`w-20 h-20 rounded-full object-cover shadow ${
                props.photoStyle === 'BLACK_AND_WHITE' ? 'grayscale' : ''
              }`}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-semibold"
              style={{ backgroundColor: style.buttonBackground, color: style.buttonTextColor }}
            >
              {props.fullName.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-semibold">{props.fullName || 'Tu nombre'}</p>
            {props.position && (
              <p className="text-[11px] opacity-70">
                {props.position}
                {props.companyName ? ` · ${props.companyName}` : ''}
              </p>
            )}
            {props.bio && <p className="text-[11px] opacity-80 mt-1 px-2">{props.bio}</p>}
          </div>

          {props.socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {props.socialLinks.map((s) => (
                <span
                  key={s.id}
                  className="text-[10px] px-2 py-1 rounded-full border opacity-90"
                  style={{ borderColor: `${style.textColor}33` }}
                >
                  {s.platform}
                </span>
              ))}
            </div>
          )}

          <div className="w-full flex flex-col gap-2 mt-2">
            {props.linkTitles.length === 0 && (
              <p className="text-[11px] opacity-40 text-center">Tus botones aparecerán aquí</p>
            )}
            {props.linkTitles.map((title, i) => (
              <div
                key={i}
                className="w-full rounded-xl border py-2.5 text-xs font-medium text-center shadow-sm"
                style={{
                  backgroundColor: style.buttonBackground,
                  borderColor: style.buttonBorder,
                  color: style.buttonTextColor,
                }}
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-400 mt-3">Vista previa en vivo</p>
    </div>
  );
}
