import type { APIRoute } from 'astro'

export const prerender = false

function renderBody(status: string, content: string) {
  const html = `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
    `
  const blob = new Blob([html])
  return blob
}

export const ALL: APIRoute = async ({ request, cookies, locals }) => {
  const ENV = locals.runtime.env || import.meta.env
  const client_id = ENV.GITHUB_CLIENT_ID
  const client_secret = ENV.GITHUB_CLIENT_SECRET
  try {
    const url = new URL(request.url)
    const server_state = url.searchParams.get('state')
    const client_state = cookies.get('oauth_state')?.value
    if (server_state !== client_state) {
      console.error('state 不存在或不匹配！')
      return new Response(renderBody('error', 'state 不存在或不匹配！'), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
        status: 401,
      })
    }
    const code = url.searchParams.get('code')
    // Github 鉴权后传 code 回调， 用 code 换 access_token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'decap-cms-oauth-login-demo',
        accept: 'application/json',
      },
      body: JSON.stringify({ client_id, client_secret, code }),
    })
    const result = await response.json()
    if (result.error) {
      console.error(result.error)
      return new Response(renderBody('error', result), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
        status: 401,
      })
    }
    const token = result.access_token
    const responseBody = renderBody('success', `token: ${token}`)
    return new Response(responseBody, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
      status: 200,
    })
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
      status: 500,
    })
  }
}
