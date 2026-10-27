---
type: guide
title: Rendering on AWS (optional)
description: How to render reels in the cloud with Remotion Lambda using your own AWS account. Not set up in this repo.
tags: [aws, lambda, remotion, rendering]
status: draft
---

# Rendering on AWS (optional)

**You don't need this.** `npm run render` works on your own computer. Cloud rendering is useful if your computer is slow or you make many videos. It is **not set up** in this repo: follow these steps only if you want it, with **your own** AWS account.

It costs money (usually a few cents per short video), and you need a card on the AWS account. If you're under 18, an adult should set this up.

## How it works

[Remotion Lambda](https://www.remotion.dev/docs/lambda) splits the video into chunks and renders them in parallel on AWS Lambda, then joins them. A 30-second reel takes well under a minute.

## Steps

1. Read the official guide first: <https://www.remotion.dev/docs/lambda/setup>. It is the source of truth; the steps below are a summary and may change.
2. Install the package (same version as `remotion` in `package.json`):
   ```bash
   npm i @remotion/lambda@<same version>
   ```
3. In AWS, create the IAM role and user exactly as the guide says. Create an **access key** for that user.
4. Put the keys in `.env` (never anywhere else):
   ```
   REMOTION_AWS_ACCESS_KEY_ID=...
   REMOTION_AWS_SECRET_ACCESS_KEY=...
   REMOTION_AWS_REGION=us-east-1
   ```
5. Check permissions, deploy the function and upload the project:
   ```bash
   npx remotion lambda policies validate
   npx remotion lambda functions deploy
   npx remotion lambda sites create src/index.ts --site-name=reel-kit
   ```
6. Render:
   ```bash
   npx remotion lambda render reel-kit <reel-name>
   ```
   The command prints a link to the finished MP4 in your S3 bucket.

## Keep costs under control

- Set a **budget alert** in AWS Billing (e.g. $5) before you start.
- Delete old videos from the S3 bucket now and then.
- `npx remotion lambda functions rmall` removes the functions if you stop using it.
- If a key leaks, delete it in AWS IAM immediately.
