import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({ name: "Hi Mom!" });
}
