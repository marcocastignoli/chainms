import type { ComponentConfig } from "@measured/puck";
import { useState, useEffect } from "react";
import { publicClient } from "../lib/contract";

const MEGO_CONTRACT_ADDRESS = "0x0540F4fabE2AE63f1aaC7A31DA8d250d6c5CDa84";
const ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_id", "type": "string"}],
    "name": "_tickets",
    "outputs": [
      {"internalType": "bool", "name": "exists", "type": "bool"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "image", "type": "string"},
      {"internalType": "uint16", "name": "numMinted", "type": "uint16"},
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

type MegoEventProps = {
  eventId: string;
  align: "left" | "center" | "right";
};

type TicketData = {
  exists: boolean;
  name: string;
  description: string;
  image: string;
  numMinted: number;
  owner: string;
};

type ApiEventData = {
  price: number;
  currency: string;
  supply: number;
  minted: number;
  event_location: string;
  timestamp_start: number;
  timestamp_end: number;
  event_description: string;
};

// eslint-disable-next-line react-refresh/only-export-components
function MegoEventRenderer({ eventId, align }: MegoEventProps) {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [apiData, setApiData] = useState<ApiEventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId.trim()) return;
      
      setLoading(true);
      setError("");
      
      try {
        // Fetch blockchain data
        const contractResult = await publicClient.readContract({
          address: MEGO_CONTRACT_ADDRESS as `0x${string}`,
          abi: ABI,
          functionName: "_tickets",
          args: [eventId],
        }) as [boolean, string, string, string, number, string];

        const [exists, name, description, image, numMinted, owner] = contractResult;
        
        if (!exists) {
          setError("Event not found");
          return;
        }

        setTicketData({
          exists,
          name,
          description,
          image,
          numMinted,
          owner
        });

        // Fetch API data
        try {
          const response = await fetch(`https://tickets-api.mego.tools/events/get/${eventId}`);
          if (response.ok) {
            const apiResponse = await response.json();
            if (!apiResponse.error && apiResponse.event) {
              setApiData({
                price: apiResponse.event.price,
                currency: apiResponse.event.currency,
                supply: apiResponse.event.supply,
                minted: apiResponse.event.minted,
                event_location: apiResponse.event.event_location,
                timestamp_start: apiResponse.event.timestamp_start,
                timestamp_end: apiResponse.event.timestamp_end,
                event_description: apiResponse.event.event_description,
              });
            }
          }
        } catch (apiError) {
          console.warn("Failed to fetch API data:", apiError);
        }
        
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: align }}>
        <div style={{ 
          display: "inline-block", 
          padding: "12px 24px", 
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          color: "#6b7280"
        }}>
          Loading event data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: align }}>
        <div style={{ 
          padding: "12px 24px", 
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626"
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!ticketData || !ticketData.exists) {
    return (
      <div style={{ padding: "20px", textAlign: align }}>
        <div style={{ 
          padding: "12px 24px", 
          backgroundColor: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: "8px",
          color: "#92400e"
        }}>
          No event found for ID: {eventId}
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: align }}>
      <div style={{
        maxWidth: "600px",
        margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        overflow: "hidden"
      }}>
        {ticketData.image && (
          <div style={{ position: "relative", paddingBottom: "40%", overflow: "hidden" }}>
            <img 
              src={ticketData.image} 
              alt={ticketData.name}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>
        )}
        
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "24px", 
              fontWeight: "700",
              color: "#1f2937",
              lineHeight: "1.3"
            }}>
              {ticketData.name}
            </h2>
            
            {apiData?.event_location && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "14px",
                color: "#6b7280",
                backgroundColor: "#f3f4f6",
                padding: "4px 8px",
                borderRadius: "6px",
                marginBottom: "12px"
              }}>
                📍 {apiData.event_location}
              </div>
            )}
          </div>

          {(apiData?.event_description || ticketData.description) && (
            <div style={{ 
              margin: "0 0 20px 0", 
              color: "#4b5563",
              lineHeight: "1.5",
              fontSize: "16px"
            }}
            dangerouslySetInnerHTML={{ 
              __html: apiData?.event_description || ticketData.description 
            }}
            />
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
          }}>
            {apiData?.price !== undefined && (
              <div style={{
                backgroundColor: "#f9fafb",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>PRICE</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                  {apiData.price} {apiData.currency?.toUpperCase()}
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>MINTED</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                {ticketData.numMinted} / {apiData?.supply || "∞"}
              </div>
            </div>
          </div>

          {apiData?.timestamp_start && (
            <div style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #dbeafe",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px"
            }}>
              <div style={{ fontSize: "12px", color: "#3730a3", fontWeight: "500", marginBottom: "4px" }}>
                EVENT DATE
              </div>
              <div style={{ fontSize: "14px", color: "#1e40af" }}>
                {formatDate(apiData.timestamp_start)}
                {apiData.timestamp_end && apiData.timestamp_end !== apiData.timestamp_start && 
                  ` - ${formatDate(apiData.timestamp_end)}`
                }
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <a 
              href={`https://app.mego.tickets/event/${eventId}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                width: "100%",
                padding: "16px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                textAlign: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s",
                border: "none",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 10px -1px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              }}
            >
              🎫 Buy Tickets
            </a>
          </div>

          <div style={{
            fontSize: "12px",
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "12px"
          }}>
            <div>Owner: {ticketData.owner}</div>
            <div style={{ marginTop: "4px" }}>Event ID: {eventId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MegoEventComponent: ComponentConfig<MegoEventProps> = {
  fields: {
    eventId: { 
      type: "text",
      label: "Event ID"
    },
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
    eventId: "0x7dBA5AB55B_049260",
    align: "center" as const,
  },
  render: ({ eventId, align }) => <MegoEventRenderer eventId={eventId} align={align} />,
};