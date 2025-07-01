"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useDashboard } from "../dashboard-state";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { PrSummaryData, computePrSummaryMetrics } from "./common";

import { ChartHeader } from "./chart-header";

export const PrSummaryMetrics = () => {
  const { filteredData } = useDashboard();
  const data = computePrSummaryMetrics(filteredData);

  return (
    <Card className="col-span-4">
      <ChartHeader
        title="PR Summary Analytics"
        description="Track PR summary creation trends and user engagement over time"
      />

      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart accessibilityLayer data={data}>
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
            <Line
              dataKey={chartConfig.totalPrSummariesCreated.key}
              type="linear"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
            />
            <Line
              dataKey={chartConfig.totalActivePrUsers.key}
              type="linear"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-4))", strokeWidth: 2, r: 4 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
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
  ["totalPrSummariesCreated"]: {
    label: "PR Summaries Created",
    key: "totalPrSummariesCreated",
  },
  ["totalActivePrUsers"]: {
    label: "Active PR Users",
    key: "totalActivePrUsers",
  },
  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
};

type DataKey = keyof PrSummaryData;
