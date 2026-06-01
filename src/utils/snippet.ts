export function titleFromContent(content: string): string {
  const firstLine = content.trim().split(/\r?\n/)[0]?.trim() ?? "";
  if (firstLine) return firstLine.slice(0, 80);
  return "未命名片段";
}

export function previewContent(content: string, max = 40): string {
  const oneLine = content.trim().replace(/\s+/g, " ");
  if (!oneLine) return "（空内容）";
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}
