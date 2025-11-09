"use client"

import { useEffect, useState } from "react";
import { Expirations} from "@/types/expirations";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function NextExpirations() {
  const [expirations, setExpirations] = useState<Expirations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpirations = async () => {
      try {
        const data = await apiClient.getNextExpirations();
        setExpirations(data);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpirations();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!expirations.length) return <p>No recent next Expirations</p>;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Proximos Vencimientos</CardTitle>
        <CardDescription>Últimas contratos y cuotas pendientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {expirations.map((expiration) => (
                <div
                key={expiration.rental_id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                    <p className="text-sm font-medium">
                    Contrato - Propiedad #{expiration.property_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    Vence {dayjs(expiration.end_date).fromNow()} {/* Fecha legible */}
                    </p>
                </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}