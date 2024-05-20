import { TransactionalEmailInputInterface } from "@/services/email/types";
import { User } from "@prisma/client";
import { LoopsClient } from "loops";

export const loops = new LoopsClient(process.env.LOOPS_API_KEY as string);

export const sendSignUpEvent = async (user: User) => {
  try {
    await loops.sendEvent({
      email: user.email,
      userId: user.id,
      eventName: "signup",
    });
  } catch (error) {
    console.error(
      `Error sending sign up event to loops:\n-Email: ${user.email}\n-ID: ${user.id}`,
      error
    );
    throw new Error("Error sending sign up event to loops");
  }
};

export const sendTransactionalEmail = ({
  email,
  transactionalId,
  dataVariables,
}: TransactionalEmailInputInterface) => {
  return loops.sendTransactionalEmail(transactionalId, email, dataVariables);
};
