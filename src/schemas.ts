import { z } from "zod";

export const MaintenanceRequestSchema = z.object({
  type: z.literal("maintenance"),
  tenantPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  propertyAddress: z.string().min(5),
  issueDescription: z.string().min(10),
  urgency: z.enum(["low", "medium", "high"]),
});

export const TenantDocumentSchema = z.object({
  type: z.literal("document"),
  tenantPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  documentName: z.string().min(3),
  actionRequired: z.boolean(),
});

export const InspectionReminderSchema = z.object({
  type: z.literal("inspection"),
  tenantPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  propertyAddress: z.string().min(5),
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  inspectionTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const AlertPayloadSchema = z.discriminatedUnion("type", [
  MaintenanceRequestSchema,
  TenantDocumentSchema,
  InspectionReminderSchema,
]);

export type AlertPayload = z.infer<typeof AlertPayloadSchema>;
