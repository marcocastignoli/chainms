/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from "@measured/puck";
import type { JsonFragment, JsonFragmentType } from "ethers";
import { marked } from "marked";
import { useWriteContract } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { publicClient } from "./lib/contract";

type Props = {
  Markdown: { content: string; align: "left" | "center" | "right" };
  Columns: { columns: number; gap: number; align: "left" | "center" | "right" };
  ImageBlock: { src: string; alt: string; width?: number; height?: number; align: "left" | "center" | "right" };
  Button: { text: string; href: string; textColor: string; backgroundColor: string; align: "left" | "center" | "right" };
  ContractView: { address: string; abi: string; functionName: string; parameters: string; autoCall: boolean; align: "left" | "center" | "right" };
  ContractWrite: { address: string; abi: string; align: "left" | "center" | "right" };
};

// eslint-disable-next-line react-refresh/only-export-components
function ContractViewComponent({ address, abi, functionName, parameters, autoCall, align }: { address: string; abi: string; functionName: string; parameters: string; autoCall: boolean; align: "left" | "center" | "right" }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{ type: "success" | "error"; data: any } | null>(null);
  const [loading, setLoading] = useState(false);

  // Parse ABI and parameters with error states
  const [parsedAbi, setParsedAbi] = useState<JsonFragment[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parsedParams, setParsedParams] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  // Parse data on prop changes
  useEffect(() => {
    try {
      const abi_parsed = JSON.parse(abi) as JsonFragment[];
      setParsedAbi(abi_parsed);
      setError("");
    } catch {
      setError("Invalid ABI JSON");
      setParsedAbi(null);
      return;
    }

    try {
      const params_parsed = parameters ? JSON.parse(parameters) : [];
      setParsedParams(params_parsed);
    } catch {
      setError("Invalid parameters JSON");
      return;
    }
  }, [abi, parameters]);

  // Find target function
  const targetFunction = parsedAbi?.find((item) => 
    item.type === "function" && item.name === functionName && (item.stateMutability === "view" || item.stateMutability === "pure")
  );

  const callFunction = async () => {
    if (!parsedAbi || !targetFunction) return;
    
    setLoading(true);
    try {
      const result = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: parsedAbi,
        functionName: targetFunction.name!,
        args: parsedParams,
      });

      setResult({ type: "success", data: result });
    } catch (error) {
      setResult({ type: "error", data: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const renderResultTable = (data: any, func: JsonFragment | undefined) => {
    if (!func?.outputs || func.outputs.length === 0) {
      return <div style={{ marginTop: "4px", wordBreak: "break-all" }}>{String(data)}</div>;
    }

    // If single output, check if it's a tuple
    if (func.outputs.length === 1) {
      const output = func.outputs[0];
      
      // Handle tuple type with components
      if (output.type === "tuple" && output.components) {
        return (
          <table style={{ marginTop: "8px", width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {output.components.map((component, index) => {
                const componentName = component.name || `field_${index}`;
                // Access tuple data by property name if it's an object, fallback to array index
                const value = (data && typeof data === 'object' && componentName in data) 
                  ? data[componentName] 
                  : (Array.isArray(data) ? data[index] : data);
                
                return (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ccc", padding: "4px", backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                      {componentName}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "4px", wordBreak: "break-all", fontFamily: "monospace" }}>
                      {formatValue(value, component.type || "unknown")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }
      
      // Regular single output (non-tuple)
      return (
        <table style={{ marginTop: "8px", width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: "4px", backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                {output.name || "result"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "4px", wordBreak: "break-all", fontFamily: "monospace" }}>
                {formatValue(data, output.type || "unknown")}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    // Multiple outputs - each output is a row
    const dataArray = Array.isArray(data) ? data : [data];
    
    return (
      <table style={{ marginTop: "8px", width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {func.outputs.map((output, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "4px", backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                {output.name || `output_${index}`}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "4px", wordBreak: "break-all", fontFamily: "monospace" }}>
                {formatValue(dataArray[index], output.type || "unknown")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "null";
    
    switch (type) {
      case "bool":
        return String(value);
      case "address":
        return String(value);
      case "string":
        return `"${value}"`;
      case "bytes":
      case "bytes32":
        return String(value);
      default:
        // For uint256, int256, etc.
        if (type.includes("uint") || type.includes("int")) {
          return String(value);
        }
        return String(value);
    }
  };

  // Auto-call effect
  useEffect(() => {
    if (autoCall && targetFunction && parsedAbi && !error) {
      callFunction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCall, address, functionName, parsedAbi, parsedParams]);

  // Error states
  if (error) {
    return (
      <div style={{ padding: "16px 0", textAlign: align }}>
        <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>
      </div>
    );
  }

  if (!targetFunction && parsedAbi) {
    return (
      <div style={{ padding: "16px 0", textAlign: align }}>
        <div style={{ color: "red", marginBottom: "8px" }}>Function "{functionName}" not found or not a view function</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 0", textAlign: align }}>
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "16px",
        backgroundColor: "#f0f8ff"
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Contract View: {functionName}</h3>
        <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
          <strong>Address:</strong> {address}
        </div>
        
        {targetFunction && targetFunction.inputs && targetFunction.inputs.length > 0 && (
          <div style={{ marginBottom: "12px", fontSize: "14px", color: "#666" }}>
            <strong>Parameters:</strong> {JSON.stringify(parsedParams)}
          </div>
        )}

        <button
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "12px"
          }}
          onClick={callFunction}
          disabled={loading}
        >
          {loading ? "Loading..." : `Call ${functionName}`}
        </button>

        {result && (
          <div style={{ 
            padding: "12px", 
            borderRadius: "4px",
            backgroundColor: result.type === "success" ? "#d4edda" : "#f8d7da",
            color: result.type === "success" ? "#155724" : "#721c24",
            fontSize: "14px"
          }}>
            <strong>{result.type === "success" ? "✓ Result:" : "✗ Error:"}</strong>
            {result.type === "success" ? renderResultTable(result.data, targetFunction) : (
              <div style={{ marginTop: "4px", wordBreak: "break-all" }}>{String(result.data)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function ContractWriteComponent({ address, abi, align }: { address: string; abi: string; align: "left" | "center" | "right" }) {
  const { writeContractAsync } = useWriteContract();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<Record<string, { type: "success" | "error"; data: any }>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement>>({});

  let parsedAbi;
  try {
    parsedAbi = JSON.parse(abi) as JsonFragment[];
  } catch {
    return (
      <div style={{ padding: "16px 0", textAlign: align }}>
        <div style={{ color: "red", marginBottom: "8px" }}>Invalid ABI JSON</div>
      </div>
    );
  }

  const functions = parsedAbi.filter((item) => 
    item.type === "function" && item.stateMutability !== "view" && item.stateMutability !== "pure"
  );

  const getInputValue = (input: JsonFragmentType, functionName: string | undefined, index: number) => {
    const inputId = `${functionName}-${input.name || index}`;
    const element = inputRefs.current[inputId];
    if (!element) return undefined;

    switch (input.type) {
      case "uint256":
      case "uint":
      case "int256":
      case "int":
        return BigInt(element.value || "0");
      case "bool":
        return (element as HTMLInputElement).checked;
      case "address":
      case "string":
      case "bytes":
      default:
        return element.value;
    }
  };

  const renderInput = (input: JsonFragmentType, functionName: string | undefined, index: number) => {
    const inputId = `${functionName}-${input.name || index}`;
    
    switch (input.type) {
      case "uint256":
      case "uint":
      case "int256":
      case "int":
        return (
          <input
            key={inputId}
            ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
            type="number"
            placeholder={`${input.name} (${input.type})`}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        );
      case "bool":
        return (
          <label key={inputId} style={{ display: "block", marginBottom: "8px" }}>
            <input 
              ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
              type="checkbox" 
              style={{ marginRight: "8px" }} 
            />
            {input.name} ({input.type})
          </label>
        );
      case "address":
        return (
          <input
            key={inputId}
            ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
            type="text"
            placeholder={`${input.name} (${input.type}) - 0x...`}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        );
      case "string":
      case "bytes":
      default:
        return (
          <input
            key={inputId}
            ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
            type="text"
            placeholder={`${input.name} (${input.type})`}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          />
        );
    }
  };

  const executeFunction = async (func: JsonFragment) => {
    try {
      const args = func.inputs?.map((input, index) => 
        getInputValue(input, func.name, index)
      ) || [];

      const result = await writeContractAsync({
        address: address as `0x${string}`,
        abi: parsedAbi,
        functionName: func.name!,
        args,
      });

      setResults(prev => ({
        ...prev,
        [func.name!]: { type: "success", data: result }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [func.name!]: { type: "error", data: (error as Error).message }
      }));
    }
  };

  return (
    <div style={{ padding: "16px 0", textAlign: align }}>
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "16px",
        backgroundColor: "#fff8f0"
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Contract Write Functions</h3>
        <div style={{ marginBottom: "16px", fontSize: "14px", color: "#666" }}>
          <strong>Address:</strong> {address}
        </div>

        {functions.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>No write functions found in ABI</div>
        ) : (
          functions.map((func, funcIndex: number) => (
            <div key={funcIndex} style={{ 
              marginBottom: "16px", 
              padding: "12px", 
              border: "1px solid #eee", 
              borderRadius: "6px",
              backgroundColor: "white"
            }}>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "bold" }}>
                {func.name}
              </h5>
              {func.inputs && func.inputs.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  {func.inputs.map((input, inputIndex: number) => 
                    renderInput(input, func.name, inputIndex)
                  )}
                </div>
              )}
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
                onClick={() => executeFunction(func)}
              >
                Execute {func.name}
              </button>
              {results[func.name!] && (
                <div style={{ 
                  marginTop: "8px", 
                  padding: "8px", 
                  borderRadius: "4px",
                  backgroundColor: results[func.name!].type === "success" ? "#d4edda" : "#f8d7da",
                  color: results[func.name!].type === "success" ? "#155724" : "#721c24",
                  fontSize: "12px",
                  wordBreak: "break-all"
                }}>
                  {results[func.name!].type === "success" ? "✓ " : "✗ "}
                  {String(results[func.name!].data)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
    ContractView: {
      fields: {
        address: { type: "text" },
        abi: { type: "textarea" },
        functionName: { type: "text" },
        parameters: { type: "textarea" },
        autoCall: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
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
        address: "0x...",
        abi: "[]",
        functionName: "balanceOf",
        parameters: "[]",
        autoCall: false,
        align: "left" as const,
      },
      render: ({ address, abi, functionName, parameters, autoCall, align }) => <ContractViewComponent address={address} abi={abi} functionName={functionName} parameters={parameters} autoCall={autoCall} align={align} />,
    },
    ContractWrite: {
      fields: {
        address: { type: "text" },
        abi: { type: "textarea" },
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
        address: "0x...",
        abi: "[]",
        align: "left" as const,
      },
      render: ({ address, abi, align }) => <ContractWriteComponent address={address} abi={abi} align={align} />,
    },
  },
};

export default config;
