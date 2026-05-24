import { ChevronUp, ChevronDown } from 'lucide-react';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  vertical?: boolean;
}

export default function VoteButtons({ upvotes, downvotes, userVote, onVote, vertical = true }: VoteButtonsProps) {
  const netVotes = upvotes - downvotes;

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => onVote('up')}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === 'up'
              ? 'bg-brand-500/20 text-brand-400'
              : 'text-surface-500 hover:text-brand-400 hover:bg-surface-800'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className={`text-sm font-bold min-w-[2ch] text-center ${
          netVotes > 0 ? 'text-brand-400' : netVotes < 0 ? 'text-red-400' : 'text-surface-400'
        }`}>
          {netVotes > 0 ? `+${netVotes}` : netVotes}
        </span>
        <button
          onClick={() => onVote('down')}
          className={`p-1.5 rounded-lg transition-all ${
            userVote === 'down'
              ? 'bg-red-500/20 text-red-400'
              : 'text-surface-500 hover:text-red-400 hover:bg-surface-800'
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onVote('up')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          userVote === 'up'
            ? 'bg-brand-500/20 text-brand-400'
            : 'text-surface-500 hover:text-brand-400 hover:bg-surface-800'
        }`}
      >
        <ChevronUp className="w-3.5 h-3.5" />
        {upvotes}
      </button>
      <button
        onClick={() => onVote('down')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          userVote === 'down'
            ? 'bg-red-500/20 text-red-400'
            : 'text-surface-500 hover:text-red-400 hover:bg-surface-800'
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
        {downvotes}
      </button>
    </div>
  );
}
