"use client"

import { useEffect, useState } from "react";
import { Activity } from "@/types/activity";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const activityMessages: Record<string, string> = {
    "CREATE_RENTAL": "Se ha agregado un nuevo Alquiler",
    "UPDATE_RENTAL": "Se ha actualizado un Alquiler",
    "DELETE_RENTAL": "Se ha eliminado un Alquiler",
    "CREATE_PROPERTY": "Se ha agregado una nueva Propiedad",
    "UPDATE_PROPERTY": "Se ha actualizado una Propiedad",
    "DELETE_PROPERTY": "Se ha eliminado una Propiedad",
    "CREATE_EXPENSE": "Se ha registrado un nuevo gasto",
    "UPDATE_EXPENSE": "Se ha actualizado un gasto",
    "DELETE_EXPENSE": "Se ha eliminado un gasto",
  };

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiClient.getRecentActivities();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!activities.length) return <p>No recent activity</p>;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas transacciones y eventos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const key = `${activity.action}_${activity.entity}`;
            const message = activityMessages[key] || `${activity.action} - ${activity.entity}`;

            return (
              <div key={activity.timestamp} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {message} #{activity.entity_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(activity.timestamp).fromNow()} {/* Fecha legible */}
                  </p>
                </div>
                {/* {activity. && (
                  <span className="text-sm font-semibold text-chart-3">
                    +{activity.amount.toLocaleString()} EUR
                  </span>
                )} */}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}