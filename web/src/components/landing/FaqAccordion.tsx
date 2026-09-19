'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { FAQS } from './faqs';

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'var(--line)' }}>
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={{ borderColor: 'var(--line)' }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-base sm:text-lg font-medium" style={{ color: 'var(--ink)' }}>
                {item.q}
              </span>
              <Plus
                className="w-5 h-5 shrink-0 transition-transform duration-300"
                style={{
                  color: 'var(--signal)',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? '200px' : '0px' }}
            >
              <p className="pb-5 pr-10 text-sm leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
