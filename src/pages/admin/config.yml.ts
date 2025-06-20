import { type APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const config = `
  backend:
    name: github
    repo: ${import.meta.env.GITHUB_REPO}
    branch: ${import.meta.env.REPO_BRANCH} # Branch to update (optional; defaults to master)
    site_domain: ${new URL(import.meta.env.SITE_URL).hostname}
    base_url: ${import.meta.env.SITE_URL}
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

  `;
  return new Response(config, {
    status: 200,
    headers: {
      'Content-Type': 'text/yaml',
    },
  });
};
