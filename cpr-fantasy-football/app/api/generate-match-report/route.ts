import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { updateMatchReport } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey, matchData, playerStats, matchSummary } = body;

    if (!matchKey || !matchData) {
      return NextResponse.json(
        { error: 'matchKey and matchData are required' },
        { status: 400 }
      );
    }

    // Build a detailed prompt for the AI
    const scoreline = `${matchData.team} ${matchData.cprScore}-${matchData.opponentScore} ${matchData.opponent}`;

    // Get top performers
    const topScorers = playerStats
      ?.filter((p: { goals: number }) => p.goals > 0)
      .map((p: { name: string; goals: number }) => `${p.name} (${p.goals})`)
      .join(', ') || 'None';

    const topAssisters = playerStats
      ?.filter((p: { assists: number }) => p.assists > 0)
      .map((p: { name: string; assists: number }) => `${p.name} (${p.assists})`)
      .join(', ') || 'None';

    const mom = playerStats?.find((p: { mom1: number }) => p.mom1 > 0)?.name || 'Not specified';
    const dod = playerStats?.find((p: { dod: number }) => p.dod > 0)?.name || 'Not specified';

    const prompt = `You are a humorous football match reporter for a Sunday league team called CPR (Clissold Park Rangers FC). Write a light-hearted, jokey match report for Instagram based on the following match information:

Match: ${scoreline}
Date: ${matchData.date}
${matchSummary ? `Summary: ${matchSummary}\n` : ''}
Goals: ${topScorers}
Assists: ${topAssisters}
Man of the Match: ${mom}
Dick of the Day: ${dod}

Write a funny, engaging match report (around 150-200 words) that:
- Has a witty opening about the result
- Mentions key players and their contributions with humorous commentary
- Makes light-hearted jokes about performances
- Uses casual, British football banter style
- Includes relevant football emojis

IMPORTANT: Always end the report with these hashtags on a new line:
#forzacpr #clissoldparkrangersfc

Keep it fun, avoid being mean-spirited, and make it Instagram-ready!`;

    // Generate the match report using OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.9, // Higher temperature for more creative/humorous output
    });

    // Save the generated report to the database
    await updateMatchReport(matchKey, text);

    return NextResponse.json({ report: text });
  } catch (error) {
    console.error('Error generating match report:', error);
    return NextResponse.json(
      { error: 'Failed to generate match report' },
      { status: 500 }
    );
  }
}
