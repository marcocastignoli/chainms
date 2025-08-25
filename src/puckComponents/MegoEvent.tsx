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
      <div style={{ padding: "2rem", textAlign: align }}>
        <div style={{ 
          display: "inline-block", 
          padding: "1rem 2rem", 
          background: "rgba(248, 249, 250, 0.8)",
          borderRadius: "12px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          color: "#666",
          fontWeight: "500"
        }}>
          Loading event data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: align }}>
        <div style={{ 
          padding: "1rem 2rem", 
          background: "rgba(220, 38, 38, 0.05)",
          border: "1px solid rgba(220, 38, 38, 0.2)",
          borderRadius: "12px",
          color: "#dc2626",
          fontWeight: "500"
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!ticketData || !ticketData.exists) {
    return (
      <div style={{ padding: "2rem", textAlign: align }}>
        <div style={{ 
          padding: "1rem 2rem", 
          background: "rgba(251, 191, 36, 0.05)",
          border: "1px solid rgba(251, 191, 36, 0.2)",
          borderRadius: "12px",
          color: "#92400e",
          fontWeight: "500"
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
    <div style={{ textAlign: align }}>
      <div style={{
        maxWidth: "400px",
        margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        {ticketData.image && (
          <div style={{ position: "relative", width: "400px", height: "400px" }}>
            <img 
              src={ticketData.image} 
              alt={ticketData.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
              padding: "2rem 1.5rem 1.5rem 1.5rem"
            }}>
              <h2 style={{ 
                margin: "0 0 0.5rem 0", 
                fontSize: "1.5rem", 
                fontWeight: "700",
                color: "white",
                lineHeight: "1.2"
              }}>
                {ticketData.name}
              </h2>
              
              {apiData?.event_location && (
                <div style={{ 
                  color: "rgba(255, 255, 255, 0.9)", 
                  fontSize: "0.9rem", 
                  marginBottom: "0.25rem" 
                }}>
                  {apiData.event_location}
                </div>
              )}
              
              {apiData?.timestamp_start && (
                <div style={{ 
                  color: "rgba(255, 255, 255, 0.9)", 
                  fontSize: "0.9rem" 
                }}>
                  {formatDate(apiData.timestamp_start)}
                  {apiData.timestamp_end && apiData.timestamp_end !== apiData.timestamp_start && 
                    ` - ${formatDate(apiData.timestamp_end)}`
                  }
                </div>
              )}
            </div>
          </div>
        )}
        
        <div style={{ padding: "1.5rem" }}>
          {(apiData?.event_description || ticketData.description) && (
            <div style={{ 
              margin: "0 0 1.5rem 0", 
              color: "#374151",
              lineHeight: "1.6",
              fontSize: "0.95rem",
              textAlign: "left"
            }}
            dangerouslySetInnerHTML={{ 
              __html: apiData?.event_description || ticketData.description 
            }}
            />
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontSize: "0.9rem",
              color: "#6B7280",
              marginBottom: "1rem"
            }}>
              {apiData?.price !== undefined && (
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  {apiData.price} {apiData.currency?.toUpperCase()}
                </span>
              )}
              <span>
                {ticketData.numMinted} / {apiData?.supply || "∞"} available
              </span>
            </div>
            
            <a 
              href={`https://app.mego.tickets/event/${eventId}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem 1.5rem",
                background: "#3B82F6",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                textAlign: "center",
                transition: "background-color 0.2s ease",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3B82F6";
              }}
            >
              Buy tickets
            </a>
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