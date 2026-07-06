'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/admin/supabase/client';
import type { DashboardOverviewData } from '@/lib/admin/overview/contracts';
import {
  buildOverviewKpis,
  buildOverviewTransactions,
  type OverviewKpiView,
  type OverviewTransactionView,
} from '@/lib/admin/overview/view-model';
import { type GreetingState } from './overview-data';
import { useOverviewSummary } from './use-overview-summary';

export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };
export type KpiCard = OverviewKpiView;
export type RecentTransaction = OverviewTransactionView;

function createChatMessageId(prefix: 'user' | 'assistant'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useOverviewState(initialGreeting: GreetingState) {
  const searchParams = useSearchParams();
  const selectedBranchId = searchParams.get('branchId');
  const overviewSummary = useOverviewSummary(selectedBranchId);
  const [userId, setUserId] = useState('MEMUAT_ID...');
  const [userRole, setUserRole] = useState('STAFF');
  const [userFullName, setUserFullName] = useState('Chief');
  const [greeting] = useState(initialGreeting);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      setUserId(user.id.slice(0, 12).toUpperCase());
      supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setUserRole(data.role.toUpperCase());
          if (data?.full_name) setUserFullName(data.full_name);
        });
    });
  }, []);

  const overviewError =
    overviewSummary.error instanceof Error
      ? overviewSummary.error.message
      : overviewSummary.error
        ? 'Gagal memuat ringkasan dashboard.'
        : null;
  const overviewData: DashboardOverviewData | undefined = overviewSummary.data;

  const onChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMessage: ChatMessage = {
      id: createChatMessageId('user'),
      role: 'user',
      content: text,
    };
    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream respons AI tidak tersedia.');
      }

      const decoder = new TextDecoder();
      let assistantText = '';
      let buffer = '';
      const assistantMessageId = createChatMessageId('assistant');
      setChatMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;

          try {
            const parsed = JSON.parse(raw) as {
              type?: string;
              delta?: string;
              error?: string;
              errorText?: string;
            };

            if (parsed.type === 'text-delta' && parsed.delta) {
              assistantText += parsed.delta;
              setChatMessages((prev) =>
                prev.map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: assistantText }
                    : message
                )
              );
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            } else if (parsed.type === 'error') {
              setChatError(parsed.error || parsed.errorText || 'Terjadi kesalahan pada AI saat memproses.');
              break;
            }
          } catch {
            // Ignore non-JSON stream lines.
          }
        }
      }
    } catch (error: unknown) {
      setChatError(error instanceof Error ? error.message : 'Gagal terhubung ke agen AI.');
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  return {
    chatContainerRef,
    chatError,
    chatInput,
    chatLoading,
    chatMessages,
    greeting,
    agentMessages: overviewData?.agentMessages ?? greeting.agentMessages,
    kpis: buildOverviewKpis(overviewData),
    overviewData,
    overviewError,
    overviewLoading: overviewSummary.isLoading,
    isChatExpanded,
    onChatSubmit,
    recentTransactions: buildOverviewTransactions(overviewData),
    setChatInput,
    setIsChatExpanded,
    userFullName,
    userId,
    userRole,
  };
}
