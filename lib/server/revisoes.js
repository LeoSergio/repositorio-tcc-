// Regras de negócio para revisões — usadas pela API e pelas Server Actions
import { createAdminClient } from '@/lib/supabase/admin'

export async function buscarRevisoes(trabalhoId) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('revisoes').select('*').eq('trabalho_id', trabalhoId)
  if (error) throw error
  return data
}
