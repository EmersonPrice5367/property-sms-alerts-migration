import { describe, it, expect } from "vitest";
import { AlertPayloadSchema } from "../src/schemas";

describe("AlertPayloadSchema", () => {
  it("validates a maintenance request with correct shape", () => {
    const payload = {
      type: "maintenance" as const,
      tenantPhone: "+15551234567",
      propertyAddress: "123 Main St, Apt 4B",
      issueDescription: "Kitchen sink leaking under cabinet",
      urgency: "high" as const,
    };
    const result = AlertPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const payload = {
      type: "maintenance" as const,
      tenantPhone: "invalid-phone",
      propertyAddress: "123 Main St",
      issueDescription: "Some issue",
      urgency: "low" as const,
    };
    const result = AlertPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("validates inspection reminder with date and time", () => {
    const payload = {
      type: "inspection" as const,
      tenantPhone: "+15559876543",
      propertyAddress: "456 Oak Ave",
      inspectionDate: "2024-03-15",
      inspectionTime: "14:30",
    };
    const result = AlertPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
