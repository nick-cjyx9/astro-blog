import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { Resend } from 'resend'

function buildFriendAuditEmail(params: {
  title: string
  link: string
  description: string
  avatar: string
  mail?: string | undefined | null
}) {
  const { title, link, description, avatar, mail } = params

  const safeAvatar = avatar && avatar.trim().length > 0 ? avatar.trim() : ''
  const hasAvatar = Boolean(safeAvatar)

  const html = `
  <div style="background:#f6f8fb;padding:24px;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead>
        <tr>
          <td style="padding:20px 24px;background:linear-gradient(90deg,#eff6ff,#eef2ff);border-bottom:1px solid #e5e7eb;">
            <h1 style="margin:0;font-size:18px;line-height:24px;color:#111827;">新的友链申请</h1>
            <p style="margin:6px 0 0 0;font-size:13px;color:#374151;">请审阅以下站点信息</p>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 12px;">
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;">站点标题</td>
                <td style="font-size:14px;color:#111827;font-weight:600;">${title}</td>
              </tr>
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;">链接</td>
                <td style="font-size:14px;">
                  <a href="${link}" style="color:#2563eb;text-decoration:none;">${link}</a>
                </td>
              </tr>
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;vertical-align:top;">描述</td>
                <td style="font-size:14px;color:#111827;line-height:1.6;">${description}</td>
              </tr>
              ${
                hasAvatar
                  ? `
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;vertical-align:top;">头像</td>
                <td>
                  <img src="${safeAvatar}" alt="Avatar" style="max-width:96px;max-height:96px;border-radius:10px;border:1px solid #e5e7eb;" />
                </td>
              </tr>
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;vertical-align:top;">头像链接</td>
                <td style="font-size:14px;color:#111827;">${safeAvatar}</td>
              </tr>
              `
                  : ''
              }
              ${
                mail
                  ? `
              <tr>
                <td style="width:120px;color:#6b7280;font-size:13px;">申请邮箱</td>
                <td style="font-size:14px;color:#111827;">${mail}</td>
              </tr>`
                  : ''
              }
            </table>

            <div style="margin-top:18px;">
              <a href="${link}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 14px;border-radius:10px;font-size:14px;text-decoration:none;">打开站点</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 24px;border-top:1px solid #e5e7eb;background:#fafafa;color:#6b7280;font-size:12px;">
            来自 Nick's Blog 的友链申请通知
          </td>
        </tr>
      </tbody>
    </table>
  </div>`

  return html
}

export const server = {
  sendFriendForm: defineAction({
    input: z.object({
      title: z.string().min(1).max(50),
      link: z.string().url(),
      description: z.string().max(100),
      avatar: z.union([z.string().url(), z.literal('')]),
      mail: z.union([z.string().email().optional(), z.literal('')]),
    }),
    handler: async (input, ctx) => {
      const { title, link, description, avatar, mail } = input
      const ENV = ctx.locals.runtime.env || import.meta.env
      const resend = new Resend(ENV.RESEND_API_KEY)
      try {
        const payload = {
          from: ENV.RESEND_EMAIL_FROM,
          to: [ENV.RESEND_EMAIL_TO],
          subject: `${title} - New Friend Link Request`,
          html: buildFriendAuditEmail({ title, link, description, avatar, mail }),
        }

        const result = await resend.emails.send(payload)
        if (!result.data)
          throw new ActionError({ code: 'SERVICE_UNAVAILABLE', message: '发送失败，请稍后重试' })
        return { success: true } as const
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('[Resend] sendFriendForm error:', {
            message: err?.message,
            name: err?.name,
            cause: err?.cause,
          })
        }
        throw new ActionError({ code: 'SERVICE_UNAVAILABLE', message: '发送失败，请稍后重试' })
      }
    },
  }),
}
