import { dispatchAlert } from "../src/alert_dispatcher";
import { AlertPayloadSchema } from "../src/schemas";

const samplePayload = {
  type: "maintenance" as const,
  tenantPhone: "+15551234567",
  propertyAddress: "123 Main St, Apt 4B",
  issueDescription: "Kitchen sink leaking under cabinet",
  urgency: "high" as const,
};

const parsed = AlertPayloadSchema.parse(samplePayload);
const result = await dispatchAlert(parsed);
console.log("Alert dispatched:", result);
