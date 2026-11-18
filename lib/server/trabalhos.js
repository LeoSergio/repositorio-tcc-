// Regras de negócio para trabalhos — usadas pela API e pelas Server Actions
import { createAdminClient } from '@/lib/supabase/admin'

export async function buscarTrabalho(id) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('trabalhos').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
