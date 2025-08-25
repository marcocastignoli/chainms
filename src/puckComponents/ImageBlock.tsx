import type { ComponentConfig } from "@measured/puck";

type ImageBlockProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  align: "left" | "center" | "right";
};

export const ImageBlockComponent: ComponentConfig<ImageBlockProps> = {
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
};