---
layout: ../../layouts/Post.astro
title: First post
pubDate: 2022-07-08
tags:
  - astro
  - blog
author: Nick
description: Lorem ipsum dolor sit amet
heroImage: ./coverImages/snipaste_2025-01-26_22-20-28.png
---

## Hello World

这是一个示例文章，用于展示如何使用 Astro 博客。
跳转到内容

搜索
GitHub
Discord
选择主题
自动
选择语言
简体中文
开始
指南
参考
集成
第三方服务
模板表达式参考
模板指令参考
配置参考
CLI 命令
导入参考
路由参考
渲染上下文
astro:actions
astro:assets
astro:config
astro:content
astro:env
astro:i18n
astro:middleware
astro:transitions
集成 API
适配器 API
内容加载器 API
图像服务 API
开发者工具栏应用 API
Container API (experimental)
编程式 Astro API（实验性）
配置实验性标志
响应式图像
字体
客户端预渲染
用于集合的 Intellisense
保留脚本顺序
Markdown 标题 ID 兼容性
Content Security Policy
旧版标志
错误参考
赞助商
本页内容
概述
类 JSX 表达式
变量
动态属性
动态 HTML
动态标签
片段
Astro 和 JSX 间的差异
组件工具函数
Astro.slots
Astro.self
Scrimba
Learn Astro with James Q Quick
Build your first site with 35 interactive Scrimba lessons

Get 20% off
模板表达式参考
Astro 组件语法是 HTML 的超集。这个语法旨在让任何有编写 HTML 或 JSX 经验的人都感到熟悉，并增加了对组件和 JavaScript 表达式的支持。

类 JSX 表达式
你可以在 Astro 组件的两个代码围栏(---)之间的 frontmatter 组件脚本内部定义本地 JavaScript 变量。然后，可以使用类似 JSX 的表达式将这些变量注入到组件的 HTML 模板中！

动态 vs 响应式

使用这种方法，你可以在 frontmatter 里设置计算的动态值。但是一旦设置完，这些值就不是响应式的了，也永远不会改变。Astro 组件是在渲染阶段中只运行一次的模板。

请参阅下面的更多例子 Astro 和 JSX 之间的差异。

变量
可以使用花括号语法将局部变量添加到 HTML 中:

src/components/Variables.astro
---
const name = "Astro";
---
<div>
  <h1>你好 {name}!</h1>  <!-- 输出 <h1>你好 Astro!</h1> -->
</div>

动态属性
可以在花括号中使用局部变量将属性值传递给 HTML 元素和组件:

src/components/DynamicAttributes.astro
---
const name = "Astro";
---
<h1 class={name}>支持属性表达式</h1>

<MyComponent templateLiteralNameAttribute={`MyNameIs${name}`} />

警告

HTML 属性将转换为字符串，因此不能将函数和对象传递给 HTML 元素。 例如，不能为 Astro 组件中的 HTML 元素分配事件处理函数:

别这样做.astro
---
function handleClick () {
    console.log("button clicked!");
}
---
<!-- ❌ 这样行不通 ❌ -->
<button onClick={handleClick}>点击我的时候什么都不会发生！</button>

相反，使用客户端脚本来添加事件处理函数，就像在普通的 JavaScript 中那样:

像这样做.astro
---
---
<button id="button">Click Me</button>
<script>
  function handleClick () {
    console.log("button clicked!");
  }
  document.getElementById("button").addEventListener("click", handleClick);
</script>

动态 HTML
可以在类 JSX 函数中使用局部变量来产生动态生成的 HTML 元素:

src/components/DynamicHtml.astro
---
const items = ["Dog", "Cat", "Platypus"];
---
<ul>
  {items.map((item) => (
    <li>{item}</li>
  ))}
</ul>

Astro 可以使用 JSX 逻辑运算符和三元表达式有条件地显示 HTML。

src/components/ConditionalHtml.astro
---
const visible = true;
---
{visible && <p>Show me!</p>}

{visible ? <p>Show me!</p> : <p>Else show me!</p>}

动态标签
你还可以将 HTML 标签赋值给变量，或重新赋值导入的组件来使用动态标签：

src/components/DynamicTags.astro
---
import MyComponent from "./MyComponent.astro";
const Element = 'div'
const Component = MyComponent;
---
<Element>Hello!</Element> <!-- 渲染成 <div>Hello!</div> -->
<Component /> <!-- 渲染成 <MyComponent /> -->

当使用动态标签时：

变量名首字母必须大写。例如，使用 Element，而不是 element。否则，Astro 将尝试把变量名渲染为文本 HTML 标签。

不支持 hydration 指令。当使用client:* hydration 指令时，Astro 需要知道哪些组件要捆绑到生产环境中，而动态标签模式阻止了这一点。

不支持 define:vars 指令。如果你不能用额外的元素（例如 <div>）包装子元素，那么你可以手动为你的 Element 添加 style={`--myVar:${value}`}。

片段
Astro 支持 <> </> 写法，并提供了内置的 <Fragment /> 组件。当添加 set:* 指令 来注入 HTML 字符串时，这个组件可以避免包装元素。

以下示例使用 <Fragment /> 组件渲染段落文本：

src/components/SetHtml.astro
---
const htmlString = '<p>Raw HTML content</p>';
---
<Fragment set:html={htmlString} />

Astro 和 JSX 间的差异
Astro 组件的语法是 HTML 的超集。它的设计使得任何有 HTML 或 JSX 经验的人都感到熟悉，但 .astro 文件和 JSX 之间有几个关键的区别。

属性
在 Astro 中，所有 HTML 属性都使用标准的 kebab-case 格式，而不是 JSX 中使用的 camelCase。这甚至适用于 class，而 React 不支持。

example.astro
<div className="box" dataValue="3" />
<div class="box" data-value="3" />

多元素
一个 Astro 组件模版可以渲染多个元素，无需像 JavaScript 或 JSX 那样将所有内容都包装在单个 <div> 或 <> 中。

src/components/RootElements.astro
---
// 包含多个元素的模板
---
<p>无需将元素包装在单个容器元素中。</p>
<p>Astro 支持模板中的多个根元素。</p>

注释
在 Astro 中，可以使用标准的 HTML 注释或 JavaScript 风格的注释。

example.astro
---
---
<!-- HTML 注释语法在.astro 文件中是有效的 -->
{/* JS 注释语法也是有效的 */}

警告

HTML 风格的注释将包含在浏览器 DOM 中，而 JS 注释将被跳过。为了保留 TODO 消息或其他仅限于开发的解释，你可能希望使用 JavaScript 样式的注释。

组件工具函数
Astro.slots
Astro.slots 包含用于修改 Astro 组件的插槽子元素的工具函数。

Astro.slots.has()
类型： (slotName: string) => boolean

你可以使用 Astro.slots.has() 检查特定插槽名称的内容是否存在。当你想要包装插槽内容但只想在插槽被使用时渲染包装元素时，这可能很有用。

src/pages/index.astro
---
---
<slot />

{Astro.slots.has('more') && (
  <aside>
    <h2>More</h2>
    <slot name="more" />
  </aside>
)}

Astro.slots.render()
类型： (slotName: string, args?: any[]) => Promise<string>

你可以使用 Astro.slots.render() 异步地将插槽的内容渲染为 HTML 字符串。

---
const html = await Astro.slots.render('default');
---
<Fragment set:html={html} />

注意

这是针对高级用例的！在大多数情况下，使用 <slot /> 元素 渲染插槽内容更简单。

Astro.slots.render() 可以接受一个可选的第二个参数：一个将被转发给任何函数子元素的参数数组。这对于自定义工具组件可能很有用。

例如，<Shout /> 组件将其 message 属性转换为大写，并将其传递给默认插槽：

src/components/Shout.astro
---
const message = Astro.props.message.toUpperCase();
let html = '';
if (Astro.slots.has('default')) {
  html = await Astro.slots.render('default', [message]);
}
---
<Fragment set:html={html} />

作为 <Shout /> 的子元素传递的回调函数将接收全大写的 message 参数：

src/pages/index.astro
---
import Shout from "../components/Shout.astro";
---
<Shout message="slots!">
  {(message) => <div>{message}</div>}
</Shout>

<!-- 渲染为 <div>SLOTS!</div> -->

回调函数可以通过带有 slot 属性的包装 HTML 元素标签传递到命名插槽中。这个元素只用于将回调传递到命名插槽中，不会被渲染到页面上。

<Shout message="slots!">
  <fragment slot="message">
    {(message) => <div>{message}</div>}
  </fragment>
</Shout>

使用标准的 HTML 元素作为包装标签，或者使用任何小写标签（例如 <fragment> 而不是 <Fragment />），这样就不会被解释为组件。不要使用 HTML <slot> 元素，因为这会被解释为 Astro 插槽。

Astro.self
Astro.self 允许递归调用 Astro 组件。这种行为允许你在组件模板中使用 <Astro.self> 从内部渲染 Astro 组件。这有助于迭代大型数据存储和嵌套数据结构。

NestedList.astro
---
const { items } = Astro.props;
---
<ul class="nested-list">
  {items.map((item) => (
    <li>
      <!-- 如果存在嵌套数据结构，我们将渲染 `<Astro.self>` -->
      <!-- 并且可以通过递归调用传递 props -->
      {Array.isArray(item) ? (
        <Astro.self items={item} />
      ) : (
        item
      )}
    </li>
  ))}
</ul>

然后可以像这样使用该组件：

---
import NestedList from './NestedList.astro';
---
<NestedList items={['A', ['B', 'C'], 'D']} />

将会渲染出这样的 HTML：

<ul class="nested-list">
  <li>A</li>
  <li>
    <ul class="nested-list">
      <li>B</li>
      <li>C</li>
    </ul>
  </li>
  <li>D</li>
</ul>

编辑此页
翻译本页内容
上一页
为文档做出贡献
下一页
模板指令参考
贡献
社区
赞助

```python
# 计算斐波那契数列
def fib(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib(n-1) + fib(n-2)
```

![test cms upload](../../assets/images/gtf89rna0aaf9_h.jpg 'Elysia')

https://example.com

H~2~O 和 x^2^

==高亮文字==

:smile: :heart: :+1:

\*转义星号\*

\\反斜线

这是一个脚注示例[^1]

[^1]: 这里是脚注内容

<div style="color:red">
  支持内嵌HTML
</div>

---

或

***

或

___

> 引用内容

>
> 多行引用

>> 嵌套引用

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 数据1  |  数据2  |  数据3 |
| 数据4  |  数据5  |  数据6 |

function hello() {
  console.log("Hello World!");
}

[文字链接](https://example.com)

[带标题的链接](https://example.com "标题文字")

直接链接：<https://example.com>

- [x] 完成
- [ ] 未完成

1. 第一项
2. 第二项
   1. 子项（缩进3空格）

- 项目1
- 项目2
  - 子项目（缩进2空格）- 子子项目（缩进4空格）
    _斜体_ 或 _斜体_
    **粗体** 或 **粗体**
    **_粗斜体_** 或 **_粗斜体_**
    ~~删除线~~
    <u>下划线</u>
    `行内代码`

## 标题

```markdown
# H1

## H2

### H3

#### H4

##### H5

###### H6
```
