import { NextRequest } from "next/server";
import { handleCompleteSignup } from "../../../../../lib/complete-signup";

export async function POST(req: NextRequest) {
  return handleCompleteSignup(req, "email");
}
