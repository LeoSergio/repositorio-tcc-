import { redirect } from 'next/navigation'
import { exigirPerfil, DESTINO_POR_PAPEL } from '@/lib/auth'

// /painel só decide para onde mandar cada perfil
export default async function InicioDoPainel() {
  const perfil = await exigirPerfil()
  const destino = DESTINO_POR_PAPEL[perfil.papel]

  if (!destino) {
    // Não deveria acontecer: o banco só aceita os 4 papéis conhecidos
    return <p className="text-sm">Papel de usuário desconhecido: {perfil.papel}.</p>
  }

  redirect(destino)
}
