import type {
  SanityBlockNode,
  SanityImageBlockNode,
  SanityPortableNode,
} from "@/types/sanity";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function applyMarks(
  text: string,
  marks: string[] = [],
  markDefs: SanityBlockNode["markDefs"] = [],
) {
  return marks.reduce((current, mark) => {
    if (mark === "strong") {
      return `<strong>${current}</strong>`;
    }

    if (mark === "em") {
      return `<em>${current}</em>`;
    }

    if (mark === "code") {
      return `<code>${current}</code>`;
    }

    if (mark === "underline") {
      return `<span style="text-decoration:underline;">${current}</span>`;
    }

    const definition = markDefs.find((item) => item._key === mark);

    if (definition?._type === "link" && definition.href) {
      const href = escapeHtml(definition.href);
      const isExternal = /^https?:\/\//.test(definition.href);
      const rel = isExternal ? ' rel="noreferrer"' : "";
      const target = isExternal ? ' target="_blank"' : "";

      return `<a href="${href}"${target}${rel}>${current}</a>`;
    }

    return current;
  }, text);
}

function renderChildren(block: SanityBlockNode) {
  return (block.children ?? [])
    .map((child) => {
      const safeText = escapeHtml(child.text ?? "").replace(/\n/g, "<br />");
      return applyMarks(safeText, child.marks, block.markDefs);
    })
    .join("");
}

function renderImageBlock(block: SanityImageBlockNode) {
  if (!block.url) {
    return "";
  }

  const alt = escapeHtml(block.alt || "");
  const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";

  return `<figure><img src="${escapeHtml(block.url)}" alt="${alt}" />${caption}</figure>`;
}

function renderBlock(block: SanityBlockNode) {
  const content = renderChildren(block);

  if (!content) {
    return "";
  }

  switch (block.style) {
    case "h1":
      return `<h1>${content}</h1>`;
    case "h2":
      return `<h2>${content}</h2>`;
    case "h3":
      return `<h3>${content}</h3>`;
    case "h4":
      return `<h4>${content}</h4>`;
    case "blockquote":
      return `<blockquote>${content}</blockquote>`;
    default:
      return `<p>${content}</p>`;
  }
}

function flushList(listType: "ul" | "ol" | null, items: string[]) {
  if (!listType || !items.length) {
    return "";
  }

  return `<${listType}>${items.join("")}</${listType}>`;
}

export function portableTextToHtml(blocks?: SanityPortableNode[] | null) {
  if (!blocks?.length) {
    return "";
  }

  const html: string[] = [];
  let currentListType: "ul" | "ol" | null = null;
  let currentListItems: string[] = [];

  for (const node of blocks) {
    if (node._type === "image") {
      html.push(flushList(currentListType, currentListItems));
      currentListType = null;
      currentListItems = [];
      html.push(renderImageBlock(node));
      continue;
    }

    const content = renderChildren(node);

    if (!content) {
      continue;
    }

    if (node.listItem) {
      const listType = node.listItem === "number" ? "ol" : "ul";

      if (currentListType && currentListType !== listType) {
        html.push(flushList(currentListType, currentListItems));
        currentListItems = [];
      }

      currentListType = listType;
      currentListItems.push(`<li>${content}</li>`);
      continue;
    }

    html.push(flushList(currentListType, currentListItems));
    currentListType = null;
    currentListItems = [];
    html.push(renderBlock(node));
  }

  html.push(flushList(currentListType, currentListItems));

  return html.filter(Boolean).join("");
}

export function portableTextToPlainText(blocks?: SanityPortableNode[] | null) {
  if (!blocks?.length) {
    return "";
  }

  return blocks
    .map((node) => {
      if (node._type === "image") {
        return node.caption || "";
      }

      return (node.children ?? []).map((child) => child.text ?? "").join("");
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
