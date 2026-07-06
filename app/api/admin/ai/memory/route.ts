import { createClient } from '@/lib/admin/supabase/server';
import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { apiData, apiError, logApiError } from '@/lib/http/responses';

export const runtime = 'edge';

type MemoryRequestBody =
  | {
      action: 'save';
      content?: string;
      recipient?: string;
    }
  | {
      action: 'mark_read';
      ids?: string[];
    }
  | {
      action?: string;
    };

function isSaveMemoryRequest(body: MemoryRequestBody): body is Extract<MemoryRequestBody, { action: 'save' }> {
  return body.action === 'save';
}

function isMarkReadRequest(body: MemoryRequestBody): body is Extract<MemoryRequestBody, { action: 'mark_read' }> {
  return body.action === 'mark_read';
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireActiveUser(supabase);
    if (!auth.ok) {
      return auth.response;
    }
    const roleError = requireRole(auth.profile, ['owner']);
    if (roleError) {
      return roleError;
    }

    const senderName = auth.profile.full_name || 'Admin';
    const body = (await req.json()) as MemoryRequestBody;

    if (isSaveMemoryRequest(body)) {
      const { content } = body;
      if (typeof content !== 'string' || content.trim().length === 0) {
        return apiError(400, 'VALIDATION_ERROR', 'Konten memori wajib diisi.');
      }

      const { error } = await supabase
        .from('sema_memories')
        .insert({
          sender_name: senderName,
          recipient_name: senderName,
          content: content.trim(),
          is_read: false
        });

      if (error) throw error;
      return apiData({ success: true });
    } 
    
    if (isMarkReadRequest(body)) {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return apiData({ success: true });
      }

      const { data: ownedMemories, error: ownedMemoriesError } = await supabase
        .from('sema_memories')
        .select('id')
        .eq('recipient_name', senderName)
        .in('id', ids);

      if (ownedMemoriesError) {
        throw ownedMemoriesError;
      }

      const ownedIds = ownedMemories?.map((memory) => memory.id) ?? [];
      if (ownedIds.length === 0) {
        return apiData({ success: true });
      }

      const { error } = await supabase
        .from('sema_memories')
        .update({ is_read: true })
        .eq('recipient_name', senderName)
        .in('id', ownedIds);

      if (error) throw error;
      return apiData({ success: true });
    }

    return apiError(400, 'VALIDATION_ERROR', 'Aksi tidak valid.');
  } catch (error: unknown) {
    return logApiError('api/admin/ai/memory', error, {
      message: 'Gagal memproses memori AI.',
    });
  }
}
