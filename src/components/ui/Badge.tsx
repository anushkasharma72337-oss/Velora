interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'cyan' | 'amber' | 'rose' | 'slate' | 'blue';
  size?: 'sm' | 'md';
}

const variants = {
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  slate: 'bg-surface-500/10 text-surface-400 border-surface-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function Badge({ children, variant = 'brand', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    } ${variants[variant]}`}>
      {children}
    </span>
  );
}
