import { SubscriptionPlanEnum } from "@prisma/client";

export interface PlanInterface {
  name: string;
  price?: string | null;
  priceId: string;
  value: SubscriptionPlanEnum;
  isMostPopular?: boolean;
}

export const plans: PlanInterface[] = [
  {
    name: "Basic",
    price: "39.99",
    priceId: "<your-price-id-here>",
    value: SubscriptionPlanEnum.BASIC,
  },
  {
    name: "Pro",
    price: "99.99",
    priceId: "<your-price-id-here>",
    value: SubscriptionPlanEnum.PRO,
    isMostPopular: true,
  },
];
