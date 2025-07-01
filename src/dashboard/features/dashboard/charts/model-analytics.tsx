"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from "recharts";
import { useDashboard } from "../dashboard-state";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { ChartHeader } from "./chart-header";
import { CopilotUsageOutput, CopilotMetrics } from "@/features/common/models";

interface ModelUsageData {
  modelName: string;
  totalEngagedUsers: number;
  totalCodeSuggestions: number;
  totalChats: number;
  isCustomModel: boolean;
  customModelTrainingDate: string | null;
  timeFrameDisplay: string;
}

interface ModelBreakdownData {
  id: string;
  name: string;
  value: number;
  fill: string;
  isCustom: boolean;
}

// Extract real model data from the raw API response or the CopilotMetrics structure
const extractModelDataFromMetrics = (filteredData: CopilotUsageOutput[]): ModelUsageData[] => {
  const modelUsageMap = new Map<string, ModelUsageData>();

  console.log("🔍 Model Analytics: Processing filtered data:", filteredData);

  filteredData.forEach((item, index) => {
    console.log(`📊 Processing item ${index}:`, {
      day: item.day,
      breakdownCount: item.breakdown?.length || 0,
      breakdown: item.breakdown
    });

    // Try to get raw API data first
    let rawData: CopilotMetrics[] | null = null;
    
    // Check if we have raw API response data
    if ((item as any).rawApiResponse) {
      try {
        rawData = JSON.parse((item as any).rawApiResponse);
      } catch (e) {
        console.log("Could not parse raw API response");
      }
    }

    // If we have raw data, extract from the detailed structure
    if (rawData && Array.isArray(rawData)) {
      rawData.forEach(dayData => {
        // Process code completion models
        dayData.copilot_ide_code_completions?.editors?.forEach(editor => {
          editor.models?.forEach(model => {
            const modelKey = `${model.name}-${item.time_frame_display}`;
            const existingData = modelUsageMap.get(modelKey) || {
              modelName: model.name,
              totalEngagedUsers: 0,
              totalCodeSuggestions: 0,
              totalChats: 0,
              isCustomModel: model.is_custom_model,
              customModelTrainingDate: model.custom_model_training_date,
              timeFrameDisplay: item.time_frame_display,
            };

            existingData.totalEngagedUsers += model.total_engaged_users;
            model.languages?.forEach(lang => {
              existingData.totalCodeSuggestions += lang.total_code_suggestions || 0;
            });
            
            modelUsageMap.set(modelKey, existingData);
          });
        });

        // Process chat models
        dayData.copilot_ide_chat?.editors?.forEach(editor => {
          editor.models?.forEach(model => {
            const modelKey = `${model.name}-${item.time_frame_display}`;
            const existingData = modelUsageMap.get(modelKey) || {
              modelName: model.name,
              totalEngagedUsers: 0,
              totalCodeSuggestions: 0,
              totalChats: 0,
              isCustomModel: model.is_custom_model,
              customModelTrainingDate: model.custom_model_training_date,
              timeFrameDisplay: item.time_frame_display,
            };

            existingData.totalEngagedUsers += model.total_engaged_users;
            existingData.totalChats += model.total_chats || 0;
            
            modelUsageMap.set(modelKey, existingData);
          });
        });

        // Process dotcom chat models
        dayData.copilot_dotcom_chat?.models?.forEach(model => {
          const modelKey = `${model.name}-${item.time_frame_display}`;
          const existingData = modelUsageMap.get(modelKey) || {
            modelName: model.name,
            totalEngagedUsers: 0,
            totalCodeSuggestions: 0,
            totalChats: 0,
            isCustomModel: model.is_custom_model,
            customModelTrainingDate: model.custom_model_training_date,
            timeFrameDisplay: item.time_frame_display,
          };

          existingData.totalEngagedUsers += model.total_engaged_users;
          existingData.totalChats += model.total_chats || 0;
          
          modelUsageMap.set(modelKey, existingData);
        });
      });
    } else {
      // Fallback to the flattened breakdown data if no raw data available
      console.log(`📋 Using breakdown data for item ${index}:`, item.breakdown);
      item.breakdown.forEach((breakdown) => {
        console.log(`🎯 Processing breakdown:`, breakdown);
        const modelKey = `${breakdown.model}-${item.time_frame_display}`;
        const existingData = modelUsageMap.get(modelKey) || {
          modelName: breakdown.model,
          totalEngagedUsers: 0,
          totalCodeSuggestions: 0,
          totalChats: 0,
          isCustomModel: breakdown.model !== "default" && breakdown.model !== "gpt-4-turbo",
          customModelTrainingDate: null,
          timeFrameDisplay: item.time_frame_display,
        };

        existingData.totalEngagedUsers += breakdown.active_users;
        existingData.totalCodeSuggestions += breakdown.suggestions_count;
        
        modelUsageMap.set(modelKey, existingData);
        console.log(`✅ Added/updated model data:`, { modelKey, data: existingData });
      });
    }
  });

  const result = Array.from(modelUsageMap.values());
  console.log("🏁 Final model usage data:", result);
  return result;
};

const computeModelBreakdownData = (modelData: ModelUsageData[]): ModelBreakdownData[] => {
  const modelMap = new Map<string, ModelBreakdownData>();

  modelData.forEach((data) => {
    const modelData = modelMap.get(data.modelName) || {
      id: data.modelName,
      name: data.modelName,
      value: 0,
      fill: "",
      isCustom: data.isCustomModel,
    };
    modelData.value += data.totalEngagedUsers;
    modelMap.set(data.modelName, modelData);
  });

  // Convert to array and calculate percentages
  let totalSum = 0;
  const models = Array.from(modelMap.values()).map((model) => {
    totalSum += model.value;
    return model;
  });

  // Calculate percentage values and assign colors
  models.forEach((model, index) => {
    model.value = Number(((model.value / totalSum) * 100).toFixed(2));
    model.fill = model.isCustom 
      ? `hsl(var(--chart-${(index % 4) + 1}))` 
      : `hsl(var(--chart-${(index % 4) + 1}))`;
  });

  return models.sort((a, b) => b.value - a.value);
};

export const ModelAnalytics = () => {
  const { filteredData } = useDashboard();
  const usageData = extractModelDataFromMetrics(filteredData);
  const breakdownData = computeModelBreakdownData(usageData);

  // Get unique models for the timeline chart
  const uniqueModels = Array.from(new Set(usageData.map((d: ModelUsageData) => d.modelName)));

  return (
    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Model Usage Over Time */}
      <Card className="col-span-1 md:col-span-2">
        <ChartHeader
          title="AI Model Usage Over Time"
          description="Track engagement and suggestions across different AI models used by GitHub Copilot"
        />
        <CardContent>
          <ChartContainer config={timelineChartConfig} className="h-80 w-full">
            <BarChart accessibilityLayer data={usageData}>
              <CartesianGrid vertical={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDataOverflow
              />
              <XAxis
                dataKey="timeFrameDisplay"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              {uniqueModels.map((model: string, index: number) => (
                <Bar
                  key={model}
                  dataKey="totalEngagedUsers"
                  stackId={model}
                  fill={`hsl(var(--chart-${(index % 4) + 1}))`}
                  radius={2}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model Distribution Pie Chart */}
      <Card className="col-span-1">
        <ChartHeader
          title="Model Usage Distribution"
          description="Percentage breakdown of users across different AI models"
        />
        <CardContent>
          <div className="w-full h-full flex flex-col gap-4">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={breakdownData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid gap-2">
              {breakdownData.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between px-2 py-1 text-sm border-b border-muted"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: model.fill }}
                    />
                    <span className="flex-1">
                      {model.name}
                      {model.isCustom && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          Custom
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="p-1 px-2 border bg-primary-foreground rounded-full text-xs">
                    {model.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Metrics */}
      <Card className="col-span-1">
        <ChartHeader
          title="Model Performance Summary"
          description="Key performance indicators across all models"
        />
        <CardContent>
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Models</span>
              <span className="font-semibold">{uniqueModels.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Custom Models</span>
              <span className="font-semibold">
                {breakdownData.filter(m => m.isCustom).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Most Used Model</span>
              <span className="font-semibold">
                {breakdownData[0]?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Custom Model Adoption</span>
              <span className="font-semibold">
                {breakdownData.filter(m => m.isCustom).reduce((sum, m) => sum + m.value, 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const timelineChartConfig = {
  totalEngagedUsers: {
    label: "Engaged Users",
    key: "totalEngagedUsers",
  },
  timeFrameDisplay: {
    label: "Time Frame",
    key: "timeFrameDisplay",
  },
};

const pieChartConfig = {
  value: {
    label: "Usage %",
    key: "value",
  },
  name: {
    label: "Model",
    key: "name",
  },
};
