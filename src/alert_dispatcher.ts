import { infrai } from "./infrai";
import { AlertPayload } from "./schemas";

function buildMessage(payload: AlertPayload): string {
  switch (payload.type) {
    case "maintenance":
      return `Maintenance request for ${payload.propertyAddress}: ${payload.issueDescription} (Urgency: ${payload.urgency})`;
    case "document":
      return `New document "${payload.documentName}" available.${payload.actionRequired ? " Action required." : ""}`;
    case "inspection":
      return `Inspection reminder for ${payload.propertyAddress} on ${payload.inspectionDate} at ${payload.inspectionTime}.`;
  }
}

export async function dispatchAlert(payload: AlertPayload): Promise<{ message_id: string }> {
  const message = buildMessage(payload);
  const idempotencyKey = `alert-${payload.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const result = await infrai.sms.batch.send(
    {
      messages: [
        {
          to: payload.tenantPhone,
          content: message,
        },
      ],
    },
    { "Idempotency-Key": idempotencyKey },
  );
  
  return result as { message_id: string };
}
