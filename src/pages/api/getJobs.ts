import prisma from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const allJobs = await prisma.trackedJobPosting.findMany({
    include: {
      author: true,
    },
  });

  return res.json({
    jobs: allJobs,
  });
}
