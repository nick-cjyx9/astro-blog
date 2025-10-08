interface MiddlewareContext {
  request: Request
  locals?: Record<string, unknown>
}

type NextFn = () => Promise<Response>

export async function onRequest(_context: MiddlewareContext, next: NextFn) {
  return next()
}
