import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center animate-bounce">
        <Sparkles className="w-6 h-6 animate-spin" />
      </div>
      <div className="space-y-2 text-center max-w-sm w-full">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Loading Dayflow HRMS...
        </h3>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
