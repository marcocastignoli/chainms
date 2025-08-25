import type { ComponentConfig } from "@measured/puck";
import React from "react";

type ColumnsProps = {
  columns: number;
  gap: number;
  align: "left" | "center" | "right";
};

export const ColumnsComponent: ComponentConfig<ColumnsProps> = {
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
          <div key={i} style={{ minHeight: "50px", padding: "10px" }}>
            {puck?.renderDropZone({ zone: `column-${i}` }) as React.ReactNode}
          </div>
        ))}
      </div>
    );
  },
};