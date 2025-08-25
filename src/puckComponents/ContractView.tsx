import type { ComponentConfig } from "@measured/puck";
import type { JsonFragment } from "ethers";
import { marked } from "marked";
import { useState, useEffect } from "react";
import { publicClient } from "../lib/contract";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractReturnedData = any;

type ContractViewProps = {
  address: string;
  abi: string;
  functionName: string;
  parameters: string;
  autoCall: boolean;
  formatType: "table" | "markdown";
  markdownTemplate: string;
  align: "left" | "center" | "right";
};

// eslint-disable-next-line react-refresh/only-export-components
function ContractViewRenderer({ address, abi, functionName, parameters, autoCall, formatType, markdownTemplate, align }: { address: string; abi: string; functionName: string; parameters: string; autoCall: boolean; formatType: "table" | "markdown"; markdownTemplate: string; align: "left" | "center" | "right" }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{ type: "success" | "error"; data: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentFormatType, setCurrentFormatType] = useState<"table" | "markdown">(formatType);

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

  const renderResultMarkdown = (data: ContractReturnedData, func: JsonFragment | undefined) => {
    if (!func?.outputs || func.outputs.length === 0) {
      const template = markdownTemplate.replace(/{result}/g, String(data));
      const html = marked.parse(template);
      return (
        <div 
          style={{ marginTop: "4px" }}
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      );
    }

    let templateWithValues = markdownTemplate;
    
    // Handle single output
    if (func.outputs.length === 1) {
      const output = func.outputs[0];
      
      // Handle tuple type with components
      if (output.type === "tuple" && output.components) {
        output.components.forEach((component, index) => {
          const componentName = component.name || `field_${index}`;
          const value = (data && typeof data === 'object' && componentName in data) 
            ? data[componentName] 
            : (Array.isArray(data) ? data[index] : data);
          const formattedValue = formatValue(value, component.type || "unknown");
          templateWithValues = templateWithValues.replace(new RegExp(`{${componentName}}`, 'g'), String(formattedValue));
        });
      } else {
        // Regular single output (non-tuple)
        const outputName = output.name || "result";
        const formattedValue = formatValue(data, output.type || "unknown");
        templateWithValues = templateWithValues.replace(new RegExp(`{${outputName}}`, 'g'), String(formattedValue));
      }
    } else {
      // Multiple outputs
      const dataArray = Array.isArray(data) ? data : [data];
      func.outputs.forEach((output, index) => {
        const outputName = output.name || `output_${index}`;
        const formattedValue = formatValue(dataArray[index], output.type || "unknown");
        templateWithValues = templateWithValues.replace(new RegExp(`{${outputName}}`, 'g'), String(formattedValue));
      });
    }

    const html = marked.parse(templateWithValues);
    return (
      <div 
        style={{ marginTop: "4px" }}
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    );
  };

  const renderResultTable = (data: ContractReturnedData, func: JsonFragment | undefined) => {
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

  const formatValue = (value: ContractReturnedData, type: string) => {
    if (value === null || value === undefined) return "null";
    
    switch (type) {
      case "bool":
        return String(value);
      case "address":
        return String(value);
      case "string":
        return `${value}`;
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
      <div>
        {result && (
          <div style={{
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <div >
              {result.type === "success" ? (
                currentFormatType === "markdown" ? renderResultMarkdown(result.data, targetFunction) : renderResultTable(result.data, targetFunction)
              ) : (
                <>
                  <div style={{ 
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#dc2626",
                    marginBottom: "12px"
                  }}>
                    ✗ Error
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#dc2626", 
                    wordBreak: "break-all",
                    fontFamily: "monospace"
                  }}>
                    {String(result.data)}
                  </div>
                </>
              )}
            </div>
            
            <div>
              <button
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
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
            marginTop: "20px", 
            padding: "16px", 
            backgroundColor: "#f9fafb", 
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px", 
            color: "#6b7280",
            marginLeft: "20px",
            marginRight: "20px",
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
            <h3 style={{ 
          margin: "0 0 20px 0", 
          fontSize: "20px", 
          fontWeight: "600",
          color: "#1a202c"
        }}>
          {functionName}
        </h3>
        
        <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
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

          <div style={{ display: "flex", gap: "4px", border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden" }}>
            <button
              style={{
                padding: "8px 12px",
                backgroundColor: currentFormatType === "table" ? "#3b82f6" : "transparent",
                color: currentFormatType === "table" ? "white" : "#6b7280",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
              onClick={() => setCurrentFormatType("table")}
            >
              Table
            </button>
            <button
              style={{
                padding: "8px 12px",
                backgroundColor: currentFormatType === "markdown" ? "#3b82f6" : "transparent",
                color: currentFormatType === "markdown" ? "white" : "#6b7280",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
              onClick={() => setCurrentFormatType("markdown")}
            >
              Markdown
            </button>
          </div>
        </div>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}

export const ContractViewComponent: ComponentConfig<ContractViewProps> = {
  fields: {
    address: { type: "text" },
    abi: { type: "textarea" },
    functionName: { type: "text" },
    parameters: { type: "textarea" },
    autoCall: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
    formatType: {
      type: "select",
      options: [
        { label: "Table", value: "table" },
        { label: "Markdown", value: "markdown" },
      ]
    },
    markdownTemplate: { type: "textarea" },
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
    formatType: "table" as const,
    markdownTemplate: "## Result\n\nThe balance is **{result}**",
    align: "left" as const,
  },
  render: ({ address, abi, functionName, parameters, autoCall, formatType, markdownTemplate, align }) => <ContractViewRenderer address={address} abi={abi} functionName={functionName} parameters={parameters} autoCall={autoCall} formatType={formatType} markdownTemplate={markdownTemplate} align={align} />,
};