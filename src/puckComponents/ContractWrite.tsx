import type { ComponentConfig } from "@measured/puck";
import type { JsonFragment, JsonFragmentType } from "ethers";
import { useWriteContract } from "wagmi";
import { useState, useRef } from "react";

type ContractWriteProps = {
  address: string;
  abi: string;
  align: "left" | "center" | "right";
};

// eslint-disable-next-line react-refresh/only-export-components
function ContractWriteRenderer({ address, abi, align }: { address: string; abi: string; align: "left" | "center" | "right" }) {
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

export const ContractWriteComponent: ComponentConfig<ContractWriteProps> = {
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
  render: ({ address, abi, align }) => <ContractWriteRenderer address={address} abi={abi} align={align} />,
};