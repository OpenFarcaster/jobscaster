import prisma from "@/db";
import { getConfig, updateLastFetchedFeedCursor } from "@/lib/config";
import { extractJobDetails } from "@/lib/llm";
import { NextApiRequest, NextApiResponse } from "next";
import chunk from "lodash/chunk";

interface NeynarFeedAPIResponse {
  casts: NeynarCast[];
  next: {
    cursor: string;
  };
}

interface NeynarCast {
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string;
  author: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    active_status: "active" | "inactive";
  };
  text: string;
  timestamp: string;
  embeds: { url: string }[];
  reactions: {
    likes: { fid: number; fname: string }[];
    recasts: { fid: number; fname: string }[];
  };
  replies: { count: number };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = getConfig();

  const queryParams = [
    "feed_type=filter",
    "filter_type=parent_url",
    `parent_url=${encodeURIComponent(
      "chain://eip155:8453/erc721:0x5fcd7a54fdf08c8dbcb969bc1f021ae87affafa8"
    )}`,
    "limit=25",
    "with_recasts=false",
  ];

  if (config.lastFetchedFeedCursor) {
    queryParams.push(`cursor=${config.lastFetchedFeedCursor}`);
  }

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/feed?${queryParams.join("&")}`,
    {
      headers: {
        api_key: process.env.NEYNAR_API_KEY,
      },
    }
  );

  const json = (await response.json()) as NeynarFeedAPIResponse;
  const chunkedCasts = chunk(json.casts, 5) as NeynarCast[][];

  for (const oneChunk of chunkedCasts) {
    console.log("Processing chunk");
    try {
      await Promise.all(
        oneChunk.map(async (cast) => {
          const extractedDetails = await extractJobDetails({
            body: cast.text,
            links: cast.embeds.map((embed) => embed.url),
            authorName: cast.author.display_name,
            authorBio: cast.author.profile.bio.text,
          });

          if (!extractedDetails) return;

          await prisma.trackedJobPosting.create({
            data: {
              hash: cast.hash,
              warpcastLink: `https://warpcast.com/${cast.author.username}/${cast.hash}`,
              author: {
                connectOrCreate: {
                  where: { fid: cast.author.fid },
                  create: {
                    fid: cast.author.fid,
                    username: cast.author.username,
                    displayName: cast.author.display_name,
                    avatar: cast.author.pfp_url,
                  },
                },
              },
              ...extractedDetails,
            },
          });
        })
      );
    } catch (error) {
      return res.json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  updateLastFetchedFeedCursor(json.next.cursor);

  return res.json({
    success: true,
  });
}
