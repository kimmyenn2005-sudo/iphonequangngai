const SITE_NAME = "HV Mobile";
const DEFAULT_IMAGE = "/assets/img-000.jpg";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value = "") {
  const url = String(value).trim();
  if (/^(https?:\/\/|\/|tel:|mailto:)/i.test(url)) return escapeHtml(url);
  return "#";
}

function localUrl(value = "", prefix = "") {
  const url = String(value).trim();
  if (/^https?:\/\//i.test(url)) return escapeHtml(url);
  if (url.startsWith("/")) return escapeHtml(prefix + url.slice(1));
  if (/^(tel:|mailto:)/i.test(url)) return escapeHtml(url);
  return url ? escapeHtml(url) : "#";
}

function inlineMarkdown(value = "") {
  let text = escapeHtml(value);
  text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;.*?&quot;)?\)/g, (_, alt, url) =>
    `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`
  );
  text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+&quot;.*?&quot;)?\)/g, (_, label, url) =>
    `<a href="${safeUrl(url)}">${label}</a>`
  );
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return text;
}

export function markdownToHtml(markdown = "") {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = "";
  let inCode = false;
  let code = [];

  const closeParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim().startsWith("```")) {
      closeParagraph();
      closeList();
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(rawLine);
      continue;
    }
    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      closeParagraph();
      const wanted = unordered ? "ul" : "ol";
      if (listType && listType !== wanted) closeList();
      if (!listType) {
        listType = wanted;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }
    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeParagraph();
      closeList();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  if (inCode && code.length) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  closeParagraph();
  closeList();
  return html.join("\n");
}

export function formatDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}

function header(active = "blog", prefix = "") {
  const nav = [
    ["home", "", "GIỚI THIỆU"],
    ["iphone", "iphone/", "IPHONE"],
    ["accessories", "phu-kien/", "PHỤ KIỆN"],
    ["warranty", "bao-hanh/", "BẢO HÀNH"],
    ["installment", "tra-gop/", "TRẢ GÓP"],
    ["tradein", "thu-cu/", "THU CŨ ĐỔI MỚI"],
    ["repair", "sua-chua/", "SỬA CHỮA"],
    ["blog", "bai-viet/", "BÀI VIẾT"],
    ["contact", "lien-he/", "LIÊN HỆ"]
  ];
  const links = nav.map(([key, href, label]) => `<a${key === active ? ' class="active" aria-current="page"' : ""} href="${prefix}${href}">${label}</a>`).join("");
  return `<header class="site-header">
  <div class="header-inner">
    <a aria-label="HV Mobile - Trang chủ" class="logo-link" href="${prefix}"><img alt="Logo HV Mobile" src="${prefix}assets/img-063.jpg"></a>
    <nav aria-label="Điều hướng chính" class="desktop-nav">${links}</nav>
    <div class="header-actions">
      <a class="zalo" href="https://zalo.me/4499562857082296287" rel="noopener" target="_blank">ZALO</a>
      <a class="call" href="tel:0901970567">GỌI NGAY</a>
      <a class="fb" href="https://www.facebook.com/HVMobile/" rel="noopener" target="_blank">FANPAGE</a>
    </div>
    <button aria-expanded="false" aria-label="Mở menu" class="menu-btn" id="menuBtn">☰</button>
  </div>
  <div class="mobile-menu" id="mobileMenu"><div class="navs">${links}</div><div class="acts"><a href="https://zalo.me/4499562857082296287" rel="noopener" target="_blank">ZALO</a><a href="tel:0901970567">GỌI NGAY 0901 970 567</a><a href="https://www.facebook.com/HVMobile/" rel="noopener" target="_blank">FANPAGE</a></div></div>
</header>`;
}

function footer(prefix = "") {
  return `<footer class="site-footer" id="footer-contact">
<div class="footer-inner">
<div class="foot-grid">
<div class="footer-brand">
<div style="color:#d4af37;font-size:30px;font-weight:700;line-height:1.2;margin-bottom:8px">HV MOBILE</div>
<p style="font-size:14px;margin:0 0 22px">Uy tín tạo nên thương hiệu</p>
<p style="margin:0;color:#fff;line-height:1.9">Hotline:<br/><a href="tel:0901970567">CS1: 0901.970.567</a><br/><a href="tel:0899822225">CS2: 0899.822.225</a></p>
</div>
<div><h4>DỊCH VỤ</h4><ul><li><a href="${prefix}iphone/">iPhone</a></li><li><a href="${prefix}phu-kien/">Phụ kiện</a></li><li><a href="${prefix}tra-gop/">Trả góp</a></li><li><a href="${prefix}thu-cu/">Thu cũ đổi mới</a></li><li><a href="${prefix}bao-hanh/">Bảo hành</a></li><li><a href="${prefix}sua-chua/">Sửa chữa</a></li></ul></div>
<div><h4>HỆ THỐNG HV MOBILE</h4><div class="branch"><strong>HV Mobile Quảng Ngãi</strong><span>43 Lê Thánh Tôn, phường Cẩm Thành, Quảng Ngãi</span><br/><a class="map-btn" href="https://www.google.com/maps/search/?api=1&amp;query=HV+Mobile+Qu%E1%BA%A3ng+Ng%C3%A3i&amp;query_place_id=ChIJkTCz6WBTaDERt37BTiZZTbM" rel="noopener" target="_blank">MỞ GOOGLE MAPS</a></div><div class="branch"><strong>HV Mobile Đà Nẵng</strong><span>649 Trần Cao Vân, phường Thanh Khê, Đà Nẵng</span><br/><a class="map-btn" href="https://www.google.com/maps/search/?api=1&amp;query=649+Tr%E1%BA%A7n+Cao+V%C3%A2n%2C+%C4%90%C3%A0+N%E1%BA%B5ng" rel="noopener" target="_blank">MỞ GOOGLE MAPS</a></div></div>
</div>
<div class="foot-bottom"><span>© 2026 HV Mobile. Đồng hành cùng bạn trong kỷ nguyên số.</span><span>Thiết kế bởi HV Mobile</span></div>
</div>
</footer><a class="float-zalo" href="https://zalo.me/4499562857082296287" rel="noopener" target="_blank">ZALO TƯ VẤN</a>`;
}

function documentShell({ title, description, canonical, image = DEFAULT_IMAGE, type = "website", schema, body, prefix = "" }) {
  return `<!doctype html>
<html lang="vi"><head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R7V5ME4MPR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-R7V5ME4MPR');
</script>

  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" type="image/png" sizes="192x192" href="${prefix}hv-mobile-google-192.png">
  <link rel="apple-touch-icon" href="${prefix}hv-mobile-google-192.png">
  <meta property="og:site_name" content="${SITE_NAME}"><meta property="og:type" content="${type}">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="${prefix}assets/hv-shell.css"><link rel="stylesheet" href="${prefix}assets/blog.css">
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>` : ""}
</head><body>${header("blog", prefix)}${body}${footer(prefix)}<script defer src="${prefix}assets/hv-shell.js"></script></body></html>`;
}

export function renderBlogIndex(posts, siteUrl) {
  const prefix = "../";
  const cards = posts.length ? posts.map(post => `<article class="post-card">
    <a class="post-card-media" href="${prefix}bai-viet/${escapeHtml(post.slug)}/"><img src="${localUrl(post.image || DEFAULT_IMAGE, prefix)}" alt="${escapeHtml(post.title)}" loading="lazy"></a>
    <div class="post-card-body"><span class="post-meta">${escapeHtml(post.category)} · ${formatDate(post.date)}</span><h2><a href="${prefix}bai-viet/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p><a class="read-more" href="${prefix}bai-viet/${escapeHtml(post.slug)}/">ĐỌC BÀI VIẾT →</a></div>
  </article>`).join("\n") : `<div class="empty-posts">HV Mobile đang chuẩn bị các bài viết hữu ích về iPhone, trả góp, thu cũ và sửa chữa.</div>`;
  const body = `<main class="blog-main"><div class="blog-wrap"><section class="blog-hero"><span class="blog-kicker">Kiến thức & cập nhật</span><h1>Bài viết từ HV Mobile</h1><p>Kinh nghiệm chọn mua và sử dụng iPhone, bảng giá, trả góp, thu cũ đổi mới và dịch vụ tại Quảng Ngãi – Đà Nẵng.</p></section><div class="post-grid">${cards}</div></div></main>`;
  return documentShell({ title: "Bài viết iPhone & Tin tức | HV Mobile", description: "Bài viết về iPhone, bảng giá, trả góp, thu cũ đổi mới và sửa chữa tại HV Mobile Quảng Ngãi – Đà Nẵng.", canonical: `${siteUrl}/bai-viet/`, body, prefix });
}

export function renderPost(post, siteUrl) {
  const prefix = "../../";
  const canonical = `${siteUrl}/bai-viet/${post.slug}/`;
  const image = post.image || DEFAULT_IMAGE;
  const absoluteImage = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.description, image: absoluteImage, datePublished: post.date, dateModified: post.date, author: { "@type": "Organization", name: post.author || SITE_NAME }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${siteUrl}/hv-mobile-google-192.png` } }, mainEntityOfPage: canonical, inLanguage: "vi-VN" };
  const hero = image ? `<div class="article-image"><img src="${localUrl(image, prefix)}" alt="${escapeHtml(post.title)}"></div>` : "";
  const body = `<main class="blog-main"><div class="article-shell"><nav class="breadcrumbs" aria-label="Đường dẫn"><a href="${prefix}">Trang chủ</a><span>›</span><a href="${prefix}bai-viet/">Bài viết</a><span>›</span><span>${escapeHtml(post.title)}</span></nav><header class="article-head"><span class="blog-kicker">${escapeHtml(post.category)}</span><h1>${escapeHtml(post.title)}</h1><p class="article-summary">${escapeHtml(post.description)}</p><div class="article-meta">${formatDate(post.date)} · ${escapeHtml(post.author || SITE_NAME)}</div></header>${hero}<article class="article-content">${markdownToHtml(post.body)}</article><aside class="article-cta"><h2>Cần tư vấn iPhone?</h2><p>Liên hệ HV Mobile để kiểm tra máy, nhận báo giá, tư vấn trả góp hoặc thu cũ đổi mới.</p><div class="article-cta-actions"><a href="https://zalo.me/4499562857082296287" target="_blank" rel="noopener">NHẮN ZALO</a><a class="secondary" href="tel:0901970567">GỌI 0901 970 567</a></div></aside></div></main>`;
  return documentShell({ title: `${post.title} | HV Mobile`, description: post.description, canonical, image: absoluteImage, type: "article", schema, body, prefix });
}
