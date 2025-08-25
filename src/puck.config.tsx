import type { Config } from "@measured/puck";
import {
  MarkdownComponent,
  ColumnsComponent,
  ImageBlockComponent,
  ButtonComponent,
  ContractViewComponent,
  ContractWriteComponent,
  MegoEventComponent,
} from "./puckComponents";

type Props = {
  Markdown: { content: string; align: "left" | "center" | "right" };
  Columns: { columns: number; gap: number; align: "left" | "center" | "right" };
  ImageBlock: { src: string; alt: string; width?: number; height?: number; align: "left" | "center" | "right" };
  Button: { text: string; href: string; textColor: string; backgroundColor: string; align: "left" | "center" | "right" };
  ContractView: { address: string; abi: string; functionName: string; parameters: string; autoCall: boolean; formatType: "table" | "markdown"; markdownTemplate: string; align: "left" | "center" | "right" };
  ContractWrite: { address: string; abi: string; align: "left" | "center" | "right" };
  MegoEvent: { eventId: string; align: "left" | "center" | "right" };
};


export const config: Config<Props> = {
  components: {
    Markdown: MarkdownComponent,
    Columns: ColumnsComponent,
    ImageBlock: ImageBlockComponent,
    Button: ButtonComponent,
    ContractView: ContractViewComponent,
    ContractWrite: ContractWriteComponent,
    MegoEvent: MegoEventComponent,
  },
};

export default config;
