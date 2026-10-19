'use client';

import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// =================================================================
// BIG PANEL — Endüstriyel kontrol paneli tarzı büyük veri kartları
// Sayı HER ŞEY. Etiket destekler. Çok nefes alan.
// =================================================================

export type PanelTone = 'neutral' | 'positive' | 'warning' | 'danger' | 'info' | 'violet' | 'amber';

const toneStyles: Record<PanelTone, {
  bg: string;
  text: string;
  accent: string;
  iconBg: string;
  border: string;
  glow: string;
}> = {
  neutral: {
    bg: 'bg-white',
    text: 'text-stone-900',
    accent: 'text-stone-700',
    iconBg: 'bg-stone-100',
    border: 'border-stone-200',
    glow: '',
  },
  positive: {
    bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
    text: 'text-emerald-950',
    accent: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-100/50',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 via-white to-amber-50',
    text: 'text-amber-950',
    accent: 'text-amber-700',
    iconBg: 'bg-amber-100',
    border: 'border-amber-200',
    glow: 'shadow-amber-100/50',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-50 via-white to-red-50',
    text: 'text-red-950',
    accent: 'text-red-700',
    iconBg: 'bg-red-100',
    border: 'border-red-200',
    glow: 'shadow-red-100/50',
  },
  info: {
    bg: 'bg-gradient-to-br from-sky-50 via-white to-sky-50',
    text: 'text-sky-950',
    accent: 'text-sky-700',
    iconBg: 'bg-sky-100',
    border: 'border-sky-200',
    glow: 'shadow-sky-100/50',
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-50 via-white to-violet-50',
    text: 'text-violet-950',
    accent: 'text-violet-700',
    iconBg: 'bg-violet-100',
    border: 'border-violet-200',
    glow: 'shadow-violet-100/50',
  },
  amber: {
    bg: 'bg-gradient-to-br from-orange-50 via-white to-orange-50',
    text: 'text-orange-950',
    accent: 'text-orange-700',
    iconBg: 'bg-orange-100',
    border: 'border-orange-200',
    glow: 'shadow-orange-100/50',
  },
};

// =================================================================
// KPI Panel — Büyük sayı + label + trend (ana hero kart)
// =================================================================
export interface KpiPanelProps {
  label: string;
  value: string | number;
  /** Önceki dönemle karşılaştırma (örn: 12, -5, %18) */
  delta?: number;
  /** Delta'nın birimi (adet, %, ₺) */
  deltaUnit?: string;
  /** Üst sağ köşede ikon/katak */
  icon?: LucideIcon;
  /** Emoji olarak da olabilir */
  emoji?: string;
  /** Renk tonu */
  tone?: PanelTone;
  /** Footer'da ekstra bilgi satırı */
  footer?: ReactNode;
  /** Alt sağ köşede ekstra bilgi */
  trailing?: ReactNode;
  /** Compact mod: daha küçük padding */
  compact?: boolean;
}

export function KpiPanel({
  label,
  value,
  delta,
  deltaUnit = '',
  icon: Icon,
  emoji,
  tone = 'neutral',
  footer,
  trailing,
  compact = false,
}: KpiPanelProps) {
  const tone_ = toneStyles[tone];

  // Delta yönü
  const deltaDir: 'up' | 'down' | 'flat' | undefined =
    delta === undefined
      ? undefined
      : delta > 0
      ? 'up'
      : delta < 0
      ? 'down'
      : 'flat';

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-kraft-hover hover:-translate-y-0.5',
        tone_.bg,
        tone_.border,
        tone_.glow,
        compact && 'p-4',
      )}
    >
      {/* Decorative accent line (top) */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          tone === 'positive' && 'bg-gradient-to-r from-emerald-400 to-emerald-600',
          tone === 'warning' && 'bg-gradient-to-r from-amber-400 to-amber-600',
          tone === 'danger' && 'bg-gradient-to-r from-red-400 to-red-600',
          tone === 'info' && 'bg-gradient-to-r from-sky-400 to-sky-600',
          tone === 'violet' && 'bg-gradient-to-r from-violet-400 to-violet-600',
          tone === 'amber' && 'bg-gradient-to-r from-orange-400 to-orange-600',
          tone === 'neutral' && 'bg-gradient-to-r from-stone-300 to-stone-400',
        )}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </p>
        {(Icon || emoji) && (
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3',
              tone_.iconBg,
            )}
          >
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : Icon ? (
              <Icon className={cn('h-5 w-5', tone_.accent)} />
            ) : null}
          </div>
        )}
      </div>

      {/* HERO VALUE */}
      <div className="mt-4 flex items-end gap-2">
        <div
          className={cn(
            'font-display font-black leading-none tracking-tight',
            'text-5xl md:text-6xl',
            tone_.text,
          )}
        >
          {value}
        </div>
        {trailing && (
          <div className={cn('pb-1 text-sm font-semibold', tone_.accent)}>
            {trailing}
          </div>
        )}
      </div>

      {/* Delta (trend) */}
      {deltaDir && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
            deltaDir === 'up' && 'bg-emerald-100 text-emerald-700',
            deltaDir === 'down' && 'bg-red-100 text-red-700',
            deltaDir === 'flat' && 'bg-stone-100 text-stone-600',
          )}
        >
          {deltaDir === 'up' && <ArrowUpRight className="h-3 w-3" />}
          {deltaDir === 'down' && <ArrowDownRight className="h-3 w-3" />}
          {deltaDir === 'flat' && <Minus className="h-3 w-3" />}
          <span>
            {delta! > 0 ? '+' : ''}
            {delta}
            {deltaUnit}
          </span>
          <span className="opacity-70">bu dönem</span>
        </div>
      )}

      {/* Footer (extra info) */}
      {footer && (
        <div className="mt-4 border-t border-stone-200/60 pt-3 text-xs text-stone-600">
          {footer}
        </div>
      )}
    </div>
  );
}

// =================================================================
// STATUS PANEL — Alarm/Aksiyon paneli (büyük dikkat çekici)
// =================================================================
export interface StatusPanelProps {
  /** Üst başlık — büyük, bold */
  title: string;
  /** Alt başlık veya açıklama */
  subtitle?: string;
  /** Sağ üst köşede emoji/ikon */
  emoji?: string;
  icon?: LucideIcon;
  tone?: PanelTone;
  /** İçerik — büyük sayaç veya liste */
  children: ReactNode;
  /** Footer bilgi satırı */
  footer?: ReactNode;
}

export function StatusPanel({
  title,
  subtitle,
  emoji,
  icon: Icon,
  tone = 'danger',
  children,
  footer,
}: StatusPanelProps) {
  const tone_ = toneStyles[tone];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6 shadow-lg',
        tone_.bg,
        tone_.border,
      )}
    >
      {/* Decorative blur background */}
      <div
        className={cn(
          'absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl',
          tone === 'danger' && 'bg-red-400',
          tone === 'warning' && 'bg-amber-400',
          tone === 'positive' && 'bg-emerald-400',
          tone === 'info' && 'bg-sky-400',
          tone === 'violet' && 'bg-violet-400',
          tone === 'amber' && 'bg-orange-400',
          tone === 'neutral' && 'bg-stone-400',
        )}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {(emoji || Icon) && (
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm',
                    tone_.iconBg,
                  )}
                >
                  {emoji ? (
                    <span className="text-3xl">{emoji}</span>
                  ) : (
                    Icon && <Icon className={cn('h-6 w-6', tone_.accent)} />
                  )}
                </div>
              )}
              <div>
                <h3 className={cn('font-display text-2xl font-black leading-tight', tone_.text)}>
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 border-t border-stone-200/60 pt-3 text-xs text-stone-600">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// =================================================================
// GAUGE PANEL — Progress/Oran göstergesi (half-circle veya bar)
// =================================================================
export interface GaugePanelProps {
  label: string;
  /** Yüzde 0-100 */
  value: number;
  /** Sol etiket (örn: 0₺) */
  minLabel?: string;
  /** Sağ etiket (örn: 100.000₺) */
  maxLabel?: string;
  /** Ton */
  tone?: PanelTone;
  /** Alt bilgi satırı */
  caption?: string;
  /** Trend delta */
  delta?: number;
}

export function GaugePanel({
  label,
  value,
  minLabel,
  maxLabel,
  tone = 'info',
  caption,
  delta,
}: GaugePanelProps) {
  const tone_ = toneStyles[tone];
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-6 shadow-sm transition-all hover:shadow-kraft-hover',
        tone_.bg,
        tone_.border,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className={cn('font-display text-3xl font-black leading-none', tone_.text)}>
            {clamped.toFixed(0)}
          </span>
          <span className={cn('text-sm font-bold', tone_.accent)}>%</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-stone-200/60">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
            tone === 'positive' && 'bg-gradient-to-r from-emerald-400 to-emerald-600',
            tone === 'warning' && 'bg-gradient-to-r from-amber-400 to-amber-600',
            tone === 'danger' && 'bg-gradient-to-r from-red-400 to-red-600',
            tone === 'info' && 'bg-gradient-to-r from-sky-400 to-sky-600',
            tone === 'violet' && 'bg-gradient-to-r from-violet-400 to-violet-600',
            tone === 'amber' && 'bg-gradient-to-r from-orange-400 to-orange-600',
            tone === 'neutral' && 'bg-gradient-to-r from-stone-400 to-stone-600',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Min/Max labels */}
      {(minLabel || maxLabel) && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-stone-500">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}

      {/* Caption + Delta */}
      {(caption || delta !== undefined) && (
        <div className="mt-3 flex items-center justify-between border-t border-stone-200/60 pt-3 text-xs">
          {caption && <span className="text-stone-600">{caption}</span>}
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold',
                delta > 0 && 'bg-emerald-100 text-emerald-700',
                delta < 0 && 'bg-red-100 text-red-700',
                delta === 0 && 'bg-stone-100 text-stone-600',
              )}
            >
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '─'} {Math.abs(delta)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// =================================================================
// MINI STAT PANEL — Operasyonel küçük bilgi kartı
// =================================================================
export interface MiniStatPanelProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Trailing unit (₺, %, adet, vb.) */
  unit?: string;
  tone?: PanelTone;
}

export function MiniStatPanel({
  icon: Icon,
  label,
  value,
  unit,
  tone = 'neutral',
}: MiniStatPanelProps) {
  const tone_ = toneStyles[tone];

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm',
        tone_.bg,
        tone_.border,
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm',
          tone_.iconBg,
        )}
      >
        <Icon className={cn('h-6 w-6', tone_.accent)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <span className={cn('font-display text-2xl font-black leading-none', tone_.text)}>
            {value}
          </span>
          {unit && <span className={cn('text-xs font-bold', tone_.accent)}>{unit}</span>}
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          {label}
        </div>
      </div>
    </div>
  );
}