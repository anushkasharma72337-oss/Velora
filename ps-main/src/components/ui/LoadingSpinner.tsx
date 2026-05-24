export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin`} />
    </div>
  );
}
