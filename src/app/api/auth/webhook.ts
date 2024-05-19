import { isProd } from "@/lib/utils";
import prisma from "@/prisma";
import { sendSignUpEvent } from "@/services/email";
import { WebhookEvent } from "@clerk/nextjs/server";

import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
      if (!id) {
        return new Response("Error occured creating user in webhook -- no id", {
          status: 400,
        });
      }
      const email = evt.data.email_addresses[0].email_address;

      const newUser = await prisma.user.create({
        data: {
          clerkSub: id,
          email,
        },
      });

      if (isProd) {
        await sendSignUpEvent(newUser);
      }

      break;

    default:
      break;
  }

  return new Response("", { status: 201 });
}
