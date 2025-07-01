import { describe, expect, it } from "vitest";
import { applyTimeFrameLabel } from "@/utils/helpers";
import { sampleData } from "@/services/sample-data";
import { computeAcceptanceAverage } from "./common";

describe("computeAcceptanceAverage", () => {
  it("correctly computes the acceptance average for provided data", () => {
    const expectedResults = [
      {
        acceptanceRate: 80.0, // (80 / 100) * 100
        timeFrameDisplay: "Mar 18",
      },
      {
        acceptanceRate: 37.5, // (15 / 40) * 100
        timeFrameDisplay: "Apr 15",
      },
    ];

    const results = computeAcceptanceAverage(applyTimeFrameLabel(sampleData));
    expect(results).toEqual(expectedResults);
  });

  it("handles empty input data gracefully", () => {
    const results = computeAcceptanceAverage([]);
    expect(results).toEqual([]);
  });

  it("handles data with zero suggested lines", () => {
    const transformedData = applyTimeFrameLabel(sampleData);
    const modifiedData = [
      {
        ...transformedData[0],
        breakdown: transformedData[0].breakdown.map((breakdown: any) => ({
          ...breakdown,
          lines_suggested: 0,
        })),
      },
    ];
    const expectedResults = [
      {
        acceptanceRate: 0, // No lines suggested, so acceptance rate should be 0
        acceptanceLinesRate: 0, // No lines suggested, so acceptance rate should be 0
        timeFrameDisplay: "Jun 24",
      },
    ];

    const results = computeAcceptanceAverage(modifiedData);
    expect(results).toEqual(expectedResults);
  });
});
