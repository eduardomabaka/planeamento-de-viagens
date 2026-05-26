import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const Icon = {
  Plane: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
  Dashboard: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  Users: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Map: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  Plus: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Bell: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Sun: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Moon: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Logout: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Search: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Edit: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>,
  Check: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  X: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Calendar: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  File: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Chat: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Dollar: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  List: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Vote: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  Book: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Download: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Heart: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Menu: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Globe: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Send: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Megaphone: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  Clock: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Briefcase: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Mountain: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>,
  TrendUp: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Sparkles: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>,
  Compass: ({ size = 20, ...p }: IconProps) => <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
};

// Modal component with glass effect
export function Modal({
  open, onClose, title, children, size = 'md',
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!open) return null;
  const widths = { sm: 420, md: 560, lg: 800 };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10, 14, 26, 0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="scale-in"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: widths[size],
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 2,
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-2)',
              border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 6, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-danger)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
          >
            <Icon.X size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// Toast notifications (redesigned)
export function Toasts({ toasts }: { toasts: { id: number; type: string; message: string }[] }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
      {toasts.map(t => {
        const config: Record<string, { gradient: string; icon: ReactNode }> = {
          success: { gradient: 'linear-gradient(135deg, #10B981, #059669)', icon: <Icon.Check size={16}/> },
          error: { gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: <Icon.X size={16}/> },
          info: { gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', icon: <Icon.Sparkles size={16}/> },
        };
        const c = config[t.type] ?? config.info;
        return (
          <div key={t.id} className="slide-up" style={{
            background: c.gradient,
            color: 'white',
            padding: '14px 18px',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: 12,
            minWidth: 280,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{c.icon}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = false,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div style={{
        padding: 16, marginBottom: 20, borderRadius: 12,
        background: danger ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-surface-2)',
        border: `1px solid ${danger ? 'rgba(239, 68, 68, 0.2)' : 'var(--color-border)'}`,
      }}>
        <p style={{ margin: 0, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// Stat card redesigned
export function StatCard({ icon, label, value, trend, color = 'var(--color-blue)', accent }: {
  icon: ReactNode; label: string; value: ReactNode; trend?: string; color?: string; accent?: string;
}) {
  return (
    <div className="card fade-in" style={{
      display: 'flex', alignItems: 'center', gap: 16,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative gradient blob */}
      {accent && <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: accent, opacity: 0.08, filter: 'blur(20px)',
        pointerEvents: 'none',
      }}/>}
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 6px 18px ${color}40`,
        position: 'relative',
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginTop: 2,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{value}</div>
        {trend && <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.TrendUp size={12}/> {trend}
        </div>}
      </div>
    </div>
  );
}

// Empty state
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'var(--color-surface-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, color: 'var(--color-text-subtle)',
      }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px', color: 'var(--color-text)', fontSize: 18, fontWeight: 700 }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>}
      {action}
    </div>
  );
}

// Spinner
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, border: '2.5px solid var(--color-border)',
      borderTopColor: 'var(--color-primary)', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// Page header component
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 28, flexWrap: 'wrap', gap: 16,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--color-text-muted)', marginTop: 6, fontSize: 15 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
