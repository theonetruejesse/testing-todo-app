import { constructRuntimeHeadersFromEnv } from "@construct/sdk/next/server";
import type { NextConfig } from "next";

const runtimeHeaders = constructRuntimeHeadersFromEnv(process.env);

const nextConfig: NextConfig = {
  ...(runtimeHeaders.length
    ? {
        async headers() {
          return runtimeHeaders;
        },
      }
    : {}),
};

export default nextConfig;
