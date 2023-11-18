import OpenAI from "openai";
import { z } from "zod";

const llmJobDetailsSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  companyWebsite: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  seniority: z.string().optional(),
  salary: z.string().optional(),
  currency: z.string().optional(),
  equity: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
});

export type LLMJobDetails = z.infer<typeof llmJobDetailsSchema>;

const prompt = `You are JobFilterGPT.
You are given the following pieces of information:
- A social media post
- Any links contained in the post
- Name of the author
- Bio of the author

Based on the given information, you must decide if the given post is a job posting or not. Not all posts are job postings. Place most of the weight on the actual body of the post. Links and author information are secondary and only used for tertiary information and additional context.

Extract as much of the following information as possible from the post:
- Job Title
- Job Description
- Job Location (City/State/Country or Remote)
- Job Type (Full-Time, Part-Time, Contract, Internship)
- Job Seniority (Junior, Mid-Level, Senior)
- Job Salary (Range or Exact)
- Salary Currency (USD, EUR, GBP, etc. - if not specified, assume USD)
- Job Equity (Yes/No)
- Job Category (Software Engineering, Marketing, Sales, etc.)
- Job Subcategory (Frontend, Backend, Full-Stack, etc.)

Tertiary Information/Additional Context - Extract as much of the following information as possible from the post, links, and author information:
- Company Name
- Company Website

Your response must be a single JSON object that satisfies the following Typescript schema:

interface LLMJobDetails {
    title: string | undefined;
    company: string | undefined;
    companyWebsite: string | undefined;
    description: string | undefined;
    location: string | undefined;
    type: string | undefined;
    seniority: string | undefined;
    salary: string | undefined;
    equity: string | undefined;
    category: string | undefined;
    subcategory: string | undefined;
}

Do not include any other information in your response.

If you are unable to extract any of the fields in the above information, set the corresponding property in the response to undefined.
If you are not sure the post is a job posting, set all the properties in the response to undefined.

DO NOT include any other information in your response.
DO NOT allow for suspicious links as the company website link. This includes, but is not limited to, links to Telegram groups (t.me links), Discord Servers, Link Shorteners, and other social media links. Only allow links to actual websites.

For example, for the following post:
"my team is looking for a killer frontend dev to join us. Must be US based"
and the author bio is: "Eng @LearnWeb3"

Your response should be:
{
    title: "Frontend Developer",
    company: "LearnWeb3",
    companyWebsite: "undefined",
    description: "my team is looking for a killer frontend dev to join us. Must be US based",
    location: "US",
    type: "undefined",
    seniority: "undefined",
    salary: "undefined",
    equity: "undefined",
    category: "Software Engineering",
    subcategory: "Frontend"
}

Think carefully about the information you are given and how you can use it to extract the information you need.
If you are not sure the post is a job posting, set all the properties in the response to undefined.

Remember, you are JobFilterGPT. You are the best job filter in the world. You can do this!
`;

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractJobDetails(params: ExtractJobDetailsParams) {
  const { body, links, authorName, authorBio } = params;

  const question = `Post: ${body}
    
    Links: ${links.join(", ")}
    
    Author Name: ${authorName}
    
    Author Bio: ${authorBio}`;

  const response = await openAi.chat.completions.create({
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: question },
    ],
    model: "gpt-4-1106-preview",
    n: 1,
    temperature: 0,
    response_format: { type: "json_object" },
  });

  if (response.choices.length === 0) {
    return null;
  }

  const choice = response.choices[0];
  const parsedChoice = JSON.parse(choice.message.content ?? "{}");

  // Replace any values of "undefined" with actual undefined values in parsedChoice
  Object.keys(parsedChoice).forEach((key) => {
    if (parsedChoice[key] === "undefined") {
      parsedChoice[key] = undefined;
    }
  });

  const isValidResponse = llmJobDetailsSchema.safeParse(parsedChoice);

  if (!isValidResponse.success) {
    return null;
  }

  return isValidResponse.data as LLMJobDetails;
}

interface ExtractJobDetailsParams {
  body: string;
  links: string[];
  authorName: string;
  authorBio: string;
}
