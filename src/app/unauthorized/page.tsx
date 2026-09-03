import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="mx-auto w-fit p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">No access</h1>
          <p className="text-xs text-slate-400 mt-1">
            Your account doesn&apos;t have access to any dashboards yet. Contact an administrator to be added.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
