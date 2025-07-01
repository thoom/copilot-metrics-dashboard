"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useDashboard } from "../dashboard-state";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { ChatDetailedMetricsData, computeDetailedChatMetrics } from "./common";

import { ChartHeader } from "./chart-header";

export const EnhancedChatMetrics = () => {
  const { filteredData } = useDashboard();
  const data = computeDetailedChatMetrics(filteredData);

  return (
    <Card className="col-span-4">
      <ChartHeader
        title="Enhanced Chat Analytics"
        description="Detailed breakdown of chat interactions: conversations, copy events, and insertion events"
      />

      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDataOverflow
            />
            <XAxis
              dataKey={chartConfig.timeFrameDisplay.key}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Bar
              dataKey={chartConfig.totalChats.key}
              fill="hsl(var(--chart-1))"
              radius={4}
            />
            <Bar
              dataKey={chartConfig.totalChatAcceptances.key}
              fill="hsl(var(--chart-2))"
              radius={4}
            />
            <Bar
              dataKey={chartConfig.totalChatCopyEvents.key}
              fill="hsl(var(--chart-3))"
              radius={4}
            />
            <Bar
              dataKey={chartConfig.totalChatInsertionEvents.key}
              fill="hsl(var(--chart-4))"
              radius={4}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const chartConfig: Record<
  DataKey,
  {
    label: string;
    key: DataKey;
  }
> = {
  ["totalChats"]: {
    label: "Total Chats",
    key: "totalChats",
  },
  ["totalChatAcceptances"]: {
    label: "Chat Acceptances",
    key: "totalChatAcceptances",
  },
  ["totalChatCopyEvents"]: {
    label: "Copy Events",
    key: "totalChatCopyEvents",
  },
  ["totalChatInsertionEvents"]: {
    label: "Insertion Events",
    key: "totalChatInsertionEvents",
  },
  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
};

type DataKey = keyof ChatDetailedMetricsData;
