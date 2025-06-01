import { z } from "zod";
import { SHIPPING_METHOD_MESSAGES } from "../constants/message.js";

export const createShippingMethodSchema = z.object({
  name: z.string().min(1, SHIPPING_METHOD_MESSAGES.NAME_REQUIRED),
  carrier: z.string().min(1, SHIPPING_METHOD_MESSAGES.CARRIER_REQUIRED),
  fee: z.number().min(0, SHIPPING_METHOD_MESSAGES.FEE_INVALID),
  estimated_days: z.number().min(0, SHIPPING_METHOD_MESSAGES.ESTIMATED_DAYS_INVALID),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: SHIPPING_METHOD_MESSAGES.STATUS_INVALID }),
  }),
});

export const updateShippingMethodSchema = createShippingMethodSchema.partial(); 