// POST /api/trabalhos/[id]/arquivo — upload do arquivo PDF
export async function POST(request, { params }) {
  // TODO: receber multipart e salvar no Supabase Storage
  return Response.json({ data: null }, { status: 201 })
}
