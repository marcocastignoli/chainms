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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {output.components.map((component, index) => {
                const componentName = component.name || `field_${index}`;
                // Access tuple data by property name if it's an object, fallback to array index
                const value = (data && typeof data === 'object' && componentName in data) 
                  ? data[componentName] 
                  : (Array.isArray(data) ? data[index] : data);
                
                return (
                  <tr key={index} style={{ borderBottom: index < output.components!.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                    <td style={{ 
                      padding: "12px 16px", 
                      backgroundColor: "#f9fafb", 
                      fontWeight: "500",
                      color: "#374151",
                      fontSize: "14px",
                      width: "30%",
                      verticalAlign: "top"
                    }}>
                      {componentName}
                    </td>
                    <td style={{ 
                      padding: "12px 16px", 
                      wordBreak: "break-all", 
                      fontFamily: "monospace",
                      fontSize: "14px",
                      color: "#1f2937"
                    }}>
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ 
                padding: "12px 16px", 
                backgroundColor: "#f9fafb", 
                fontWeight: "500",
                color: "#374151",
                fontSize: "14px",
                width: "30%",
                verticalAlign: "top"
              }}>
                {output.name || "result"}
              </td>
              <td style={{ 
                padding: "12px 16px", 
                wordBreak: "break-all", 
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#1f2937"
              }}>
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
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {func.outputs.map((output, index) => (
            <tr key={index} style={{ borderBottom: index < (func.outputs?.length || 0) - 1 ? "1px solid #e5e7eb" : "none" }}>
              <td style={{ 
                padding: "12px 16px", 
                backgroundColor: "#f9fafb", 
                fontWeight: "500",
                color: "#374151",
                fontSize: "14px",
                width: "30%",
                verticalAlign: "top"
              }}>
                {output.name || `output_${index}`}
              </td>
              <td style={{ 
                padding: "12px 16px", 
                wordBreak: "break-all", 
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#1f2937"
              }}>
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
        border: "1px solid #e1e5e9", 
        borderRadius: "12px", 
        padding: "24px",
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ 
          margin: "0 0 20px 0", 
          fontSize: "20px", 
          fontWeight: "600",
          color: "#1a202c"
        }}>
          {functionName}
        </h3>
        
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            style={{
              padding: "10px 16px",
              backgroundColor: loading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
            onClick={callFunction}
            disabled={loading}
          >
            {loading ? "Loading..." : `Refresh Data`}
          </button>

          <button
            style={{
              padding: "10px 16px",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"} details
          </button>
        </div>

        {showAdvanced && (
          <div style={{ 
            marginBottom: "20px", 
            padding: "16px", 
            backgroundColor: "#f9fafb", 
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px", 
            color: "#6b7280" 
          }}>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Contract Address</div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>{address}</div>
            </div>
            {targetFunction && targetFunction.inputs && targetFunction.inputs.length > 0 && (
              <div>
                <div style={{ fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Parameters</div>
                <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{JSON.stringify(parsedParams)}</div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div style={{ 
            border: "1px solid #d8d8d8ff",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <div style={{ 
              display: result.type == "success" ? "none" : "block",
              padding: "12px 16px", 
              borderBottom: result.type === "success" ? "1px solid #d1fae5" : "1px solid #fecaca",
              fontSize: "14px",
              fontWeight: "500",
              color: result.type === "success" ? "#166534" : "#dc2626"
            }}>
              {result.type != "success" && "✗ Error"}
            </div>
            <div style={{ padding: "16px" }}>
              {result.type === "success" ? renderResultTable(result.data, targetFunction) : (
                <div style={{ 
                  fontSize: "14px", 
                  color: "#dc2626", 
                  wordBreak: "break-all",
                  fontFamily: "monospace" 
                }}>
                  {String(result.data)}
                </div>
              )}
            </div>
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
          <div key={inputId} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: "6px" 
            }}>
              {input.name} <span style={{ color: "#6b7280", fontWeight: "400" }}>({input.type})</span>
            </label>
            <input
              ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
              type="number"
              placeholder={`Enter ${input.name}`}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                transition: "border-color 0.2s"
              }}
            />
          </div>
        );
      case "bool":
        return (
          <div key={inputId} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input 
              ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
              type="checkbox" 
              style={{ 
                width: "16px", 
                height: "16px",
                borderRadius: "4px"
              }} 
            />
            <label style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#374151" 
            }}>
              {input.name} <span style={{ color: "#6b7280", fontWeight: "400" }}>({input.type})</span>
            </label>
          </div>
        );
      case "address":
        return (
          <div key={inputId} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: "6px" 
            }}>
              {input.name} <span style={{ color: "#6b7280", fontWeight: "400" }}>({input.type})</span>
            </label>
            <input
              ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
              type="text"
              placeholder="0x..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                fontFamily: "monospace",
                transition: "border-color 0.2s"
              }}
            />
          </div>
        );
      case "string":
      case "bytes":
      default:
        return (
          <div key={inputId} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: "6px" 
            }}>
              {input.name} <span style={{ color: "#6b7280", fontWeight: "400" }}>({input.type})</span>
            </label>
            <input
              ref={(el) => { if (el) inputRefs.current[inputId] = el; }}
              type="text"
              placeholder={`Enter ${input.name}`}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
                transition: "border-color 0.2s"
              }}
            />
          </div>
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
        border: "1px solid #e1e5e9", 
        borderRadius: "12px", 
        padding: "24px",
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>

        <div style={{ 
          marginBottom: "20px", 
          padding: "12px 16px", 
          backgroundColor: "#f9fafb", 
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "14px", 
          color: "#6b7280" 
        }}>
          <div style={{ fontWeight: "500", color: "#374151", marginBottom: "4px" }}>Contract Address</div>
          <div style={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>{address}</div>
        </div>

        {functions.length === 0 ? (
          <div style={{ 
            color: "#6b7280", 
            fontStyle: "italic", 
            textAlign: "center", 
            padding: "40px 20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            No write functions found in ABI
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {functions.map((func, funcIndex: number) => (
              <div key={funcIndex} style={{ 
                border: "1px solid #e5e7eb", 
                borderRadius: "12px",
                backgroundColor: "white",
                overflow: "hidden"
              }}>
                <div style={{ 
                  padding: "16px 20px", 
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <h5 style={{ 
                    margin: "0", 
                    fontSize: "16px", 
                    fontWeight: "600",
                    color: "#1a202c"
                  }}>
                    {func.name}
                  </h5>
                </div>
                
                <div style={{ padding: "20px" }}>
                  {func.inputs && func.inputs.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ 
                        fontSize: "14px", 
                        fontWeight: "500", 
                        color: "#374151", 
                        marginBottom: "12px" 
                      }}>
                        Parameters:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {func.inputs.map((input, inputIndex: number) => 
                          renderInput(input, func.name, inputIndex)
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      marginBottom: results[func.name!] ? "16px" : "0"
                    }}
                    onClick={() => executeFunction(func)}
                  >
                    Execute {func.name}
                  </button>
                  
                  {results[func.name!] && (
                    <div style={{ 
                      border: results[func.name!].type === "success" ? "1px solid #d1fae5" : "1px solid #fecaca",
                      borderRadius: "8px",
                      backgroundColor: results[func.name!].type === "success" ? "#f0fdf4" : "#fef2f2",
                      overflow: "hidden"
                    }}>
                      <div style={{ 
                        padding: "12px 16px", 
                        backgroundColor: results[func.name!].type === "success" ? "#dcfce7" : "#fee2e2",
                        borderBottom: results[func.name!].type === "success" ? "1px solid #d1fae5" : "1px solid #fecaca",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: results[func.name!].type === "success" ? "#166534" : "#dc2626"
                      }}>
                        {results[func.name!].type === "success" ? "✓ Transaction Sent" : "✗ Error"}
                      </div>
                      <div style={{ 
                        padding: "16px",
                        fontSize: "14px",
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                        color: results[func.name!].type === "success" ? "#166534" : "#dc2626"
                      }}>
                        {String(results[func.name!].data)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
