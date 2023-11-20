import { NextApiRequest } from "next";
import nacl from "tweetnacl";

interface RequestValidationOptions {
  [key: string]: {
    headers: string[];
  };
}

interface RequestValidationResult {
  error: {
    status: number;
    message: string;
  } | null;
}

/** Converts a hexadecimal string to Uint8Array. */
export function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}

/** Validates the request by checking the method and required headers. */
export function validateRequest(
  req: NextApiRequest,
  options: RequestValidationOptions,
): RequestValidationResult {
  const { method } = req;

  if (method !== "POST") {
    return {
      error: {
        status: 405,
        message: "Method Not Allowed",
      },
    };
  }

  const { headers } = options[method];

  for (const header of headers) {
    if (!req.headers[header.toLowerCase()]) {
      return {
        error: {
          status: 400,
          message: `Missing required header: ${header}`,
        },
      };
    }
  }

  return {
    error: null,
  };
}

/** Verify whether the request is coming from Discord. */
export async function verifySignature(
  request: NextApiRequest,
): Promise<{ valid: boolean; body: string }> {
  // Discord sends these headers with every request.
  const signature = request.headers["x-signature-ed25519"] as string;
  const timestamp = request.headers["x-signature-timestamp"] as string;

  const body = JSON.stringify(request.body);

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(process.env.PUBLIC_KEY as string),
  );

  return { valid, body };
}
