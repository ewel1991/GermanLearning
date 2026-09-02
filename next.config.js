/** @type {import('next').NextConfig} */
const nextConfig = {
  // getTopics.ts reads data/topics.json via fs at request time — Next's
  // automatic file tracing can miss a path built from process.cwd() +
  // path.join(), so this makes sure the file always ships to Vercel's
  // serverless functions instead of failing with ENOENT in production.
  outputFileTracingIncludes: {
    "/**": ["./data/topics.json"],
  },
};

module.exports = nextConfig;
