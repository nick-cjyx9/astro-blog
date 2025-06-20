import { type APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = async ({ request, cookies }) => {
    const client_id = import.meta.env.GITHUB_CLIENT_ID;
    try {
        const url = new URL(request.url);
        const state = crypto.getRandomValues(new Uint8Array(12)).join('')
        
        // 设置 cookie 时添加安全选项
        cookies.set('oauth_state', state, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
            maxAge: 60 * 10 // 10 分钟
        });

        // 使用 302 代替 301 并手动构建响应
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');
        redirectUrl.searchParams.set('client_id', client_id);
        redirectUrl.searchParams.set('redirect_uri', url.origin + '/admin/callback');
        redirectUrl.searchParams.set('scope', 'repo user');
        redirectUrl.searchParams.set('state', state);
        return new Response(null, {
            status: 302,
            headers: new Headers({
                'Location': redirectUrl.href
            })
        });

    } catch (error: any) {
        console.error(error);
        return new Response(error.message, {
            status: 500,
        });
    }
};
