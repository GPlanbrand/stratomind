export default async function handler(req: Request) {
  return new Response(JSON.stringify({
    success: true,
    message: 'API正常工作'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
