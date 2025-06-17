import { type APIRoute } from "astro";

export const ALL: APIRoute = async ({ request, cookies }) => {
    const client_id = import.meta.env.GITHUB_CLIENT_ID;
    try {
        const url = new URL(request.url);
        const state = crypto.getRandomValues(new Uint8Array(12)).join('')
        // 带 state 重定向到 Github 鉴权
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');
        redirectUrl.searchParams.set('client_id', client_id);
        redirectUrl.searchParams.set('redirect_uri', url.origin + '/admin/callback');
        redirectUrl.searchParams.set('scope', 'repo user');
        redirectUrl.searchParams.set('state', state);
        cookies.set('oauth_state', state)
        return Response.redirect(redirectUrl.href, 301);

    } catch (error: any) {
        console.error(error);
        return new Response(error.message, {
            status: 500,
        });
    }
};
