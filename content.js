(function () {
  "use strict";

  // Prevent double injection
  if (window.__webToMd_loaded) return;
  window.__webToMd_loaded = true;

  // ============ HTML to Markdown converter ============

  function htmlToMarkdown(element) {
    let md = convertNode(element);
    md = md.replace(/\n{3,}/g, "\n\n").trim();
    return md;
  }

  function convertNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, " ");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();

    if (isHiddenOrIrrelevant(node, tag)) return "";

    const children = Array.from(node.childNodes)
      .map((c) => convertNode(c))
      .join("");

    switch (tag) {
      case "h1": return "\n\n# " + children.trim() + "\n\n";
      case "h2": return "\n\n## " + children.trim() + "\n\n";
      case "h3": return "\n\n### " + children.trim() + "\n\n";
      case "h4": return "\n\n#### " + children.trim() + "\n\n";
      case "h5": return "\n\n##### " + children.trim() + "\n\n";
      case "h6": return "\n\n###### " + children.trim() + "\n\n";
      case "p": return "\n\n" + children.trim() + "\n\n";
      case "div": case "section": case "article": case "main": case "header":
        return "\n\n" + children + "\n\n";
      case "br": return "\n";
      case "hr": return "\n\n---\n\n";
      case "strong": case "b": return "**" + children.trim() + "**";
      case "em": case "i": return "*" + children.trim() + "*";
      case "del": case "s": case "strike": return "~~" + children.trim() + "~~";
      case "code":
        if (node.parentElement && node.parentElement.tagName.toLowerCase() === "pre") return children;
        return "`" + children.trim() + "`";
      case "pre": {
        const codeEl = node.querySelector("code");
        const lang = codeEl ? detectLanguage(codeEl) : "";
        const code = codeEl ? codeEl.textContent : node.textContent;
        return "\n\n```" + lang + "\n" + code.trim() + "\n```\n\n";
      }
      case "a": {
        const href = node.getAttribute("href");
        const text = children.trim();
        if (!href || href.startsWith("javascript:")) return text;
        const absHref = new URL(href, document.baseURI).href;
        return "[" + text + "](" + absHref + ")";
      }
      case "img": {
        const src = node.getAttribute("src");
        const alt = node.getAttribute("alt") || "";
        if (!src) return "";
        const absSrc = new URL(src, document.baseURI).href;
        return "![" + alt + "](" + absSrc + ")";
      }
      case "ul": return "\n\n" + convertList(node, "ul") + "\n\n";
      case "ol": return "\n\n" + convertList(node, "ol") + "\n\n";
      case "li": return children;
      case "blockquote": {
        const lines = children.trim().split("\n");
        return "\n\n" + lines.map((l) => "> " + l).join("\n") + "\n\n";
      }
      case "table": return "\n\n" + convertTable(node) + "\n\n";
      case "script": case "style": case "noscript": case "svg":
      case "canvas": case "iframe": case "video": case "audio":
        return "";
      case "figure": return "\n\n" + children + "\n\n";
      case "figcaption": return "\n\n*" + children.trim() + "*\n\n";
      case "details": return "\n\n" + children + "\n\n";
      case "summary": return "**" + children.trim() + "**\n\n";
      case "mark": return "==" + children.trim() + "==";
      case "sup": return "^" + children.trim() + "^";
      case "sub": return "~" + children.trim() + "~";
      default: return children;
    }
  }

  function isHiddenOrIrrelevant(node, tag) {
    const ignoreTags = new Set([
      "nav", "footer", "aside", "script", "style", "noscript",
      "svg", "canvas", "iframe", "video", "audio"
    ]);
    if (ignoreTags.has(tag)) return true;
    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return true;
    return false;
  }

  function detectLanguage(codeEl) {
    const cls = codeEl.className || "";
    const match = cls.match(/(?:language|lang|highlight)-(\w+)/);
    return match ? match[1] : "";
  }

  function convertList(listNode, type) {
    const items = Array.from(listNode.children).filter(
      (c) => c.tagName && c.tagName.toLowerCase() === "li"
    );
    return items
      .map((li, idx) => {
        const prefix = type === "ol" ? (idx + 1) + ". " : "- ";
        const content = convertNode(li).trim().replace(/\n/g, "\n  ");
        return prefix + content;
      })
      .join("\n");
  }

  function convertTable(tableNode) {
    const rows = Array.from(tableNode.querySelectorAll("tr"));
    if (rows.length === 0) return "";
    const matrix = rows.map((row) =>
      Array.from(row.querySelectorAll("th, td")).map((cell) =>
        convertNode(cell).trim().replace(/\|/g, "\\|").replace(/\n/g, " ")
      )
    );
    const maxCols = Math.max(...matrix.map((r) => r.length));
    const padded = matrix.map((r) => {
      while (r.length < maxCols) r.push("");
      return r;
    });
    const headerRow = "| " + padded[0].join(" | ") + " |";
    const separator = "| " + padded[0].map(() => "---").join(" | ") + " |";
    const bodyRows = padded.slice(1).map((r) => "| " + r.join(" | ") + " |");
    return [headerRow, separator, ...bodyRows].join("\n");
  }

  // ============ Clipboard & Toast ============

  function copyAndNotify(markdown) {
    navigator.clipboard.writeText(markdown).then(
      () => showToast("Markdown 已复制到剪贴板!"),
      () => {
        const ta = document.createElement("textarea");
        ta.value = markdown;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Markdown 已复制到剪贴板!");
      }
    );
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 24px",
      backgroundColor: "#333",
      color: "#fff",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "system-ui, sans-serif",
      zIndex: "2147483647",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      transition: "opacity 0.3s ease",
      opacity: "1",
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ============ Full page convert ============

  function getMainContent() {
    const selectors = ["article", "main", '[role="main"]', ".post-content", ".article-content", ".entry-content"];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return document.body;
  }

  window.__webToMd_convertFull = function () {
    const title = document.title;
    const url = document.location.href;
    const contentEl = getMainContent();
    let markdown = "# " + title + "\n\n";
    markdown += "> Source: " + url + "\n\n";
    markdown += htmlToMarkdown(contentEl);
    copyAndNotify(markdown);
  };

  // ============ Area picker mode ============

  window.__webToMd_startPicker = function () {
    // If already in picker mode, do nothing
    if (window.__webToMd_pickerActive) return;
    window.__webToMd_pickerActive = true;

    let hoveredEl = null;

    // Overlay for highlight
    const overlay = document.createElement("div");
    overlay.id = "__webToMd_overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      pointerEvents: "none",
      border: "3px solid #1a73e8",
      backgroundColor: "rgba(26, 115, 232, 0.08)",
      borderRadius: "4px",
      zIndex: "2147483646",
      transition: "all 0.1s ease",
      display: "none",
    });
    document.body.appendChild(overlay);

    // Toolbar hint
    const hint = document.createElement("div");
    hint.id = "__webToMd_hint";
    hint.innerHTML = '<span style="margin-right:12px">请点击要复制的区域</span><span style="cursor:pointer;padding:2px 10px;border:1px solid rgba(255,255,255,0.4);border-radius:4px" id="__webToMd_cancel">ESC 取消</span>';
    Object.assign(hint.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      padding: "10px 20px",
      backgroundColor: "#1a73e8",
      color: "#fff",
      fontSize: "14px",
      fontFamily: "system-ui, sans-serif",
      zIndex: "2147483647",
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    });
    document.body.appendChild(hint);

    function updateOverlay(el) {
      if (!el || el === document.body || el === document.documentElement) {
        overlay.style.display = "none";
        return;
      }
      const rect = el.getBoundingClientRect();
      Object.assign(overlay.style, {
        display: "block",
        top: rect.top + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        height: rect.height + "px",
      });
    }

    function onMouseMove(e) {
      // Ignore our own UI elements
      if (e.target.closest("#__webToMd_overlay") || e.target.closest("#__webToMd_hint")) return;
      hoveredEl = e.target;
      updateOverlay(hoveredEl);
    }

    function onScroll() {
      if (hoveredEl) updateOverlay(hoveredEl);
    }

    function onClick(e) {
      // Ignore clicks on our cancel button
      if (e.target.id === "__webToMd_cancel") {
        cleanup();
        return;
      }
      // Ignore our own UI
      if (e.target.closest("#__webToMd_overlay") || e.target.closest("#__webToMd_hint")) return;

      e.preventDefault();
      e.stopPropagation();

      const targetEl = hoveredEl || e.target;
      const title = document.title;
      const url = document.location.href;

      let markdown = "# " + title + "\n\n";
      markdown += "> Source: " + url + "\n\n";
      markdown += htmlToMarkdown(targetEl);

      copyAndNotify(markdown);
      cleanup();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        cleanup();
        showToast("已取消选择");
      }
    }

    function cleanup() {
      window.__webToMd_pickerActive = false;
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("scroll", onScroll, true);
      overlay.remove();
      hint.remove();
    }

    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("scroll", onScroll, true);
  };
})();
