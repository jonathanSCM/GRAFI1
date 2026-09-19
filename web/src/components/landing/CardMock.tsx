import Image from 'next/image';

export default function CardMock() {
  return (
    <div className="relative w-full max-w-[360px] aspect-[1.58/1] mx-auto lp-card-float">
      <div
        className="lp-notch absolute inset-0 flex items-center justify-center"
        style={{
          background: '#ffffff',
          boxShadow: '0 30px 60px -20px rgba(11,27,46,0.22)',
        }}
      >
        {/* sheen */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.9) 50%, transparent 65%)',
          }}
        />

        {/* signal notch fill */}
        <div
          className="absolute top-0 right-0 w-7 h-7"
          style={{ background: 'var(--signal)', clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        />

        {/* Logo centrado */}
        <Image
          src="/brand-icon.png"
          alt="Grafi"
          width={72}
          height={72}
          className="relative rounded-2xl"
        />
      </div>
    </div>
  );
}
