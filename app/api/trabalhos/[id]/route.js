// GET /api/trabalhos/[id]  — detalhes do trabalho
// PATCH /api/trabalhos/[id] — atualizar metadados
// DELETE /api/trabalhos/[id] — remover trabalho

export async function GET(request, { params }) {
  return Response.json({ data: null })
}

export async function PATCH(request, { params }) {
  return Response.json({ data: null })
}

export async function DELETE(request, { params }) {
  return new Response(null, { status: 204 })
}
