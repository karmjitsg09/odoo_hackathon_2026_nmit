import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Code2, Database, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  moduleName: string;
  targetRole: 'employee' | 'admin' | 'all';
  targetPhase?: string;
  databaseTable?: string;
  suggestedFeatures?: string[];
  alternateRoleUrl?: string;
  alternateRoleLabel?: string;
}

export function PlaceholderPage({
  title,
  description,
  moduleName,
  targetRole,
  targetPhase = 'Phase 2',
  databaseTable,
  suggestedFeatures = [],
  alternateRoleUrl,
  alternateRoleLabel,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <Badge variant={targetRole === 'admin' ? 'danger' : 'primary'}>
              {targetRole.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
              {targetPhase} Ready
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        {alternateRoleUrl && (
          <Link
            href={alternateRoleUrl}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {alternateRoleLabel || 'Switch View'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Developer Foundation Info Card */}
      <Alert variant="info" title="Phase 1 Foundation Active">
        This route foundation is configured and ready for feature implementation. Database schemas, RLS policies, and typed query handlers for <code className="font-mono text-indigo-400 font-semibold">{databaseTable || moduleName}</code> are established.
      </Alert>

      {/* Grid of Preview Cards / Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Scope Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-500" />
              <CardTitle>Planned Implementation Scope</CardTitle>
            </div>
            <CardDescription>
              Checklist for developer implementing this module in subsequent phases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedFeatures.length > 0 ? (
              <ul className="space-y-2.5">
                {suggestedFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Feature details defined in PRD.</p>
            )}

            {databaseTable && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Underlying PostgreSQL Table:</span>
                <code className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                  public.{databaseTable}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & RLS Specs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-base">RLS Enforcement</CardTitle>
            </div>
            <CardDescription>Security boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Row-Level Security (RLS) is strictly enabled for this module.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-400">
              <p className="text-indigo-400 font-semibold">Security Rules:</p>
              <p>• Employee: Own records only</p>
              <p>• Admin/HR: Full management</p>
              <p>• Service Role: Server-only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wireframe Placeholder Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            UI Canvas Preview & Placeholder Area
          </div>
          <Badge variant="outline" className="text-xs">Skeleton Ready</Badge>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-36 w-full" />
        </div>
      </Card>
    </div>
  );
}
