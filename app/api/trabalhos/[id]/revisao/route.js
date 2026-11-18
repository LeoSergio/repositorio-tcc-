// GET  /api/trabalhos/[id]/revisao — listar revisões do trabalho
// POST /api/trabalhos/[id]/revisao — adicionar parecer
export async function GET(request, { params }) {
  return Response.json({ data: [] })
}

export async function POST(request, { params }) {
  return Response.json({ data: null }, { status: 201 })
}
