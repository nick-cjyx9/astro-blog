import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) => {
  const ENV = locals.runtime.env || import.meta.env
  const config = `
  backend:
    name: github
    repo: ${ENV.GITHUB_REPO}
    branch: ${ENV.REPO_BRANCH} # Branch to update (optional; defaults to master)
    site_domain: ${new URL(ENV.SITE_URL).hostname}
    base_url: ${ENV.SITE_URL}
    auth_endpoint: /admin/auth
    commit_messages:
      create: 'content: create {{collection}} {{slug}}'
      update: 'content: update {{collection}} {{slug}}'
      delete: 'content: delete {{collection}} {{slug}}'
      uploadMedia: 'content: upload “{{path}}”'
      deleteMedia: 'content: delete “{{path}}”'
      openAuthoring: 'chore: {{message}}'
  media_folder: /src/assets/images # 文件将被存储在仓库中的位置
  public_folder: ../../assets/images # 上传媒体文件的 src 属性
  logo_url: /admin-logo.png
  collections:
    - name: blog
      label: Posts
      folder: src/content/blog
      create: true
      slug: '{{slug}}'
      editor:
        preview: true
      fields:
        - {label: Layout, name: layout, widget: hidden, default: ../../layouts/Post.astro}
        - {label: Title, name: title, widget: string}
        - {label: Published Date, name: pubDate, widget: datetime}
        - {label: Tags, name: tags, widget: list}
        - {label: Author, name: author, widget: string}
        - {label: Description, name: description, widget: string}
        - {label: Hero Image, name: heroImage, widget: image, required: false, media_folder: coverImages}
        - {label: Body, name: body, widget: markdown}
    - name: friend
      label: Friends
      folder: src/content/friend
      create: true
      identifier_field: name
      slug: '{{slug}}'
      editor:
        preview: false
      fields:
        - {label: Name, name: name, widget: string}
        - {label: Link, name: link, widget: string}
        - {label: Description, name: description, widget: string}
        - {label: Avatar, name: avatar, widget: image}
        - {label: Color, name: color, widget: color, default: '#000000', allowInput: true}
    - name: project
      label: Projects
      folder: src/content/project
      create: true
      identifier_field: name
      slug: '{{slug}}'
      editor:
        preview: false
      fields:
        - {label: Title, name: title, widget: string}
        - {label: Description, name: description, widget: string}
        - {label: Tech, name: tech, widget: list}
        - {label: Link, name: link, widget: string}
        - {label: Status, name: status, widget: select, options: ['正在开发', '计划中', '筹备中', '已完成', '已暂停']}
  `
  return new Response(config, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml',
    },
  })
}
