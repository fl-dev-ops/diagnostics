import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const region = process.env.S3_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error("S3 signing configuration is incomplete");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

function parseS3BucketAndKey(inputUrl: string) {
  const url = new URL(inputUrl);
  const pathname = url.pathname.replace(/^\/+/, "");

  if (!pathname) {
    throw new Error(`Invalid S3 object URL path: ${inputUrl}`);
  }

  const host = url.hostname;

  const virtualHostedStyle = host.match(/^([^.]+)\.s3(?:[.-][^.]+)?\.amazonaws\.com$/i);

  if (virtualHostedStyle?.[1]) {
    return {
      bucket: virtualHostedStyle[1],
      key: pathname,
    };
  }

  if (host === "s3.amazonaws.com") {
    const [bucket, ...rest] = pathname.split("/");
    const key = rest.join("/");

    if (!bucket || !key) {
      throw new Error(`Invalid path-style S3 URL: ${inputUrl}`);
    }

    return {
      bucket,
      key,
    };
  }

  const configuredBucket = process.env.S3_BUCKET;

  if (!configuredBucket) {
    throw new Error("S3_BUCKET is required to parse non-AWS-standard S3 URLs");
  }

  if (pathname.startsWith(`${configuredBucket}/`)) {
    return {
      bucket: configuredBucket,
      key: pathname.slice(configuredBucket.length + 1),
    };
  }

  return {
    bucket: configuredBucket,
    key: pathname,
  };
}

export async function getPresignedVideoUrl(input: {
  objectUrl: string;
  expiresInSeconds?: number;
}) {
  const { bucket, key } = parseS3BucketAndKey(input.objectUrl);
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 3600,
  });
}
