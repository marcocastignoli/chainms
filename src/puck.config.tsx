import type { Config } from "@measured/puck";
import { marked } from "marked";

type Props = {
  Markdown: { content: string; align: "left" | "center" | "right" };
  Columns: { columns: number; gap: number; align: "left" | "center" | "right" };
  ImageBlock: { src: string; alt: string; width?: number; height?: number; align: "left" | "center" | "right" };
  Button: { text: string; href: string; textColor: string; backgroundColor: string; align: "left" | "center" | "right" };
};

export const config: Config<Props> = {
  components: {
    Markdown: {
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
    },
    Columns: {
      fields: {
        columns: { type: "number" },
        gap: { type: "number" },
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
        columns: 2,
        gap: 20,
        align: "left" as const,
      },
      render: ({ columns, gap, align, puck }) => {
        return (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: `${gap}px`,
            padding: "16px 0",
            textAlign: align
          }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} style={{ minHeight: "50px", border: "1px dashed #ccc", padding: "10px" }}>
                {puck?.renderDropZone({ zone: `column-${i}` }) as React.ReactNode}
              </div>
            ))}
          </div>
        );
      },
    },
    ImageBlock: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        width: { type: "number" },
        height: { type: "number" },
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
        src: "https://placehold.co/600x400",
        alt: "Placeholder image",
        align: "left" as const,
      },
      render: ({ src, alt, width, height, align }) => (
        <div style={{ padding: "8px 0", textAlign: align }}>
          <img 
            src={src} 
            alt={alt}
            width={width || 400}
            height={height || 300}
            style={{ 
              maxWidth: "100%", 
              height: "auto",
            }} 
          />
        </div>
      ),
    },
    Button: {
      fields: {
        text: { type: "text" },
        href: { type: "text" },
        textColor: { type: "text" },
        backgroundColor: { type: "text" },
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
        text: "Click me",
        href: "#",
        textColor: "white",
        backgroundColor: "#007bff",
        align: "left" as const,
      },
      render: ({ text, href, textColor, backgroundColor, align }) => {
        return (
          <div style={{ padding: "16px 0", textAlign: align }}>
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "12px 24px",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s",
                color: textColor,
                backgroundColor: backgroundColor,
                border: `2px solid ${backgroundColor}`,
              }}
            >
              {text}
            </a>
          </div>
        );
      },
    },
  },
};

export default config;
