import type { ComponentConfig } from "@measured/puck";
import { marked } from "marked";

type MarkdownProps = {
  content: string;
  align: "left" | "center" | "right";
};

export const MarkdownComponent: ComponentConfig<MarkdownProps> = {
  fields: {
    content: { type: "textarea" },
    align: {
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ]
    },
  },
  defaultProps: {
    content: "# Hello World\n\nWrite your **markdown** here!",
    align: "left" as const,
  },
  render: ({ content, align }) => {
    const html = marked.parse(content);
    return (
      <div 
        style={{ padding: "16px 0", textAlign: align }}
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    );
  },
};