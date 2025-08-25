import type { ComponentConfig } from "@measured/puck";

type ButtonProps = {
  text: string;
  href: string;
  textColor: string;
  backgroundColor: string;
  align: "left" | "center" | "right";
};

export const ButtonComponent: ComponentConfig<ButtonProps> = {
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
};