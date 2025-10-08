import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = async ({ request, cookies, locals }) => {
  const ENV = locals.runtime.env || import.meta.env
  const client_id = ENV.GITHUB_CLIENT_ID
  try {
    const url = new URL(request.url)
    const state = crypto.getRandomValues(new Uint8Array(12)).join('')

    // 设置 cookie 时添加安全选项
    cookies.set('oauth_state', state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: ENV.PROD,
      maxAge: 60 * 10, // 10 分钟
    })

    // 使用 302 代替 301 并手动构建响应
    const redirectUrl = new URL('https://github.com/login/oauth/authorize')
    redirectUrl.searchParams.set('client_id', client_id)
    redirectUrl.searchParams.set('redirect_uri', `${url.origin}/admin/callback`)
    redirectUrl.searchParams.set('scope', 'repo user')
    redirectUrl.searchParams.set('state', state)
    return new Response(null, {
      status: 302,
      headers: new Headers({
        Location: redirectUrl.href,
      }),
    })
  } catch (error: unknown) {
    console.error(error)
    return new Response((error as Error).message, {
      status: 500,
    })
  }
}
