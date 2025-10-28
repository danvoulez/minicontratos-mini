import { ReactNode } from "react";

export interface MDUIToken {
  type:
    | "card"
    | "section"
    | "notice"
    | "textinput"
    | "datepicker"
    | "toggle"
    | "button"
    | "text"
    | "markdown";
  props?: Record<string, unknown>;
  content?: string;
  children?: MDUIToken[];
}

/**
 * Parse MD-UI syntax from markdown text
 * Supports:
 * - :::card title="..." icon="..." status="..." ::: blocks
 * - {{toggle id="..." label="..." checked=...}}
 * - {{input id="..." label="..." placeholder="..."}}
 * - {{date id="..." label="..."}}
 * - [Label](action:actionName {...payload})
 * - :::notice type="info|warning|error" title="..." ::: blocks
 * - :::section title="..." ::: blocks
 */
export function parseMDUI(content: string): MDUIToken[] {
  const tokens: MDUIToken[] = [];
  let currentIndex = 0;

  while (currentIndex < content.length) {
    // Try to parse block components (:::card, :::notice, :::section)
    const blockMatch = content
      .slice(currentIndex)
      .match(/^:::(\w+)\s+([^\n]*)\n([\s\S]*?)^:::/m);

    if (blockMatch && blockMatch.index === 0) {
      const [fullMatch, blockType, propsStr, blockContent] = blockMatch;
      const props = parseProps(propsStr);

      let token: MDUIToken;

      if (blockType === "card") {
        token = {
          type: "card",
          props,
          children: parseMDUI(blockContent.trim()),
        };
      } else if (blockType === "notice") {
        token = {
          type: "notice",
          props,
          content: blockContent.trim(),
        };
      } else if (blockType === "section") {
        token = {
          type: "section",
          props,
          children: parseMDUI(blockContent.trim()),
        };
      } else {
        // Unknown block type, treat as text
        token = { type: "text", content: fullMatch };
      }

      tokens.push(token);
      currentIndex += fullMatch.length;
      continue;
    }

    // Try to parse inline components {{...}}
    const inlineMatch = content
      .slice(currentIndex)
      .match(/\{\{(\w+)\s+([^}]+)\}\}/);

    if (inlineMatch && inlineMatch.index !== undefined) {
      // Add any text before the match
      if (inlineMatch.index > 0) {
        const textBefore = content.slice(
          currentIndex,
          currentIndex + inlineMatch.index
        );
        if (textBefore.trim()) {
          tokens.push({ type: "markdown", content: textBefore });
        }
      }

      const [fullMatch, componentType, propsStr] = inlineMatch;
      const props = parseProps(propsStr);

      let token: MDUIToken;

      if (componentType === "toggle") {
        token = { type: "toggle", props };
      } else if (componentType === "input") {
        token = { type: "textinput", props };
      } else if (componentType === "date") {
        token = { type: "datepicker", props };
      } else {
        token = { type: "text", content: fullMatch };
      }

      tokens.push(token);
      currentIndex += inlineMatch.index + fullMatch.length;
      continue;
    }

    // Try to parse action links [Label](action:name {...})
    const actionMatch = content
      .slice(currentIndex)
      .match(/\[([^\]]+)\]\(action:(\w+)\s*(\{[^}]*\})?\)/);

    if (actionMatch && actionMatch.index !== undefined) {
      // Add any text before the match
      if (actionMatch.index > 0) {
        const textBefore = content.slice(
          currentIndex,
          currentIndex + actionMatch.index
        );
        if (textBefore.trim()) {
          tokens.push({ type: "markdown", content: textBefore });
        }
      }

      const [fullMatch, label, action, payloadStr] = actionMatch;
      let payload: Record<string, unknown> = {};

      if (payloadStr) {
        try {
          payload = JSON.parse(payloadStr);
        } catch (e) {
          // Ignore parse errors
        }
      }

      tokens.push({
        type: "button",
        props: { label, action, payload },
      });

      currentIndex += actionMatch.index + fullMatch.length;
      continue;
    }

    // No special syntax found, consume the rest as markdown/text
    const remainingText = content.slice(currentIndex);
    if (remainingText.trim()) {
      tokens.push({ type: "markdown", content: remainingText });
    }
    break;
  }

  return tokens;
}

/**
 * Parse props from a string like: title="Hello" icon="🎉" status="success"
 */
function parseProps(propsStr: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  // Match key="value" or key=value patterns
  const propRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\w+))/g;
  let match: RegExpExecArray | null;

  while ((match = propRegex.exec(propsStr)) !== null) {
    const [, key, quotedValue1, quotedValue2, unquotedValue] = match;
    let value: unknown = quotedValue1 || quotedValue2 || unquotedValue;

    // Convert boolean strings
    if (value === "true") value = true;
    if (value === "false") value = false;

    // Convert number strings
    if (typeof value === "string" && !Number.isNaN(Number(value))) {
      value = Number(value);
    }

    props[key] = value;
  }

  return props;
}
