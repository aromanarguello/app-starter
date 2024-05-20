import prisma from "@/prisma";

export const getUserByClerkSub = async (clerkSub?: string | null) => {
  if (!clerkSub) {
    console.error(`User not found by Clerk sub: ${clerkSub}`);
    return null;
  }

  try {
    const user = await prisma?.user.findUnique({
      where: {
        clerkSub,
      },
    });

    return user;
  } catch (error) {
    throw new Error(`Error getting user by Clerk sub: ${error}`);
  }
};
