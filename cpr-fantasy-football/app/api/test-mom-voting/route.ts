import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { submitMomVote, getMomVoteResults, revealMomResults, areMomResultsRevealed } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey } = body;

    if (!matchKey) {
      return NextResponse.json(
        { error: 'matchKey is required' },
        { status: 400 }
      );
    }

    console.log('\n=== Starting MoM Voting Test ===');
    console.log('Match Key:', matchKey);

    // Step 1: Clear any existing votes for this match
    console.log('\nStep 1: Clearing existing votes...');
    await sql`DELETE FROM mom_votes WHERE match_key = ${matchKey}`;

    // Also clear any match submission
    await sql`DELETE FROM match_submissions WHERE match_key = ${matchKey}`;
    console.log('✓ Cleared existing data');

    // Step 2: Generate test data
    const testPlayers = [
      { name: 'Test Player A', votes: Math.floor(Math.random() * 5) + 1 },
      { name: 'Test Player B', votes: Math.floor(Math.random() * 5) + 1 },
      { name: 'Test Player C', votes: Math.floor(Math.random() * 5) + 1 },
      { name: 'Test Player D', votes: Math.floor(Math.random() * 5) + 1 },
    ];

    console.log('\nStep 2: Generated test players:');
    testPlayers.forEach(p => console.log(`  ${p.name}: ${p.votes} votes`));

    // Step 3: Submit votes
    console.log('\nStep 3: Submitting votes...');
    let voterIndex = 1;
    for (const player of testPlayers) {
      for (let i = 0; i < player.votes; i++) {
        const voterId = `test_voter_${voterIndex}`;
        await submitMomVote(matchKey, player.name, voterId);
        voterIndex++;
      }
    }
    const totalVotes = testPlayers.reduce((sum, p) => sum + p.votes, 0);
    console.log(`✓ Submitted ${totalVotes} votes from ${voterIndex - 1} unique voters`);

    // Step 4: Check results before reveal
    console.log('\nStep 4: Checking results before reveal...');
    const resultsBeforeReveal = await getMomVoteResults(matchKey);
    const revealedBefore = await areMomResultsRevealed(matchKey);
    console.log('Results revealed before:', revealedBefore);
    console.log('Vote counts:', resultsBeforeReveal);

    // Step 5: Reveal results
    console.log('\nStep 5: Revealing results...');
    await revealMomResults(matchKey);
    console.log('✓ Results revealed');

    // Step 6: Check results after reveal
    console.log('\nStep 6: Checking results after reveal...');
    const resultsAfterReveal = await getMomVoteResults(matchKey);
    const revealedAfter = await areMomResultsRevealed(matchKey);
    console.log('Results revealed after:', revealedAfter);
    console.log('Final results:', resultsAfterReveal);

    // Step 7: Test vote update
    console.log('\nStep 7: Testing vote update...');
    const testVoterId = 'test_voter_1';
    console.log(`Original vote from ${testVoterId}:`, testPlayers[0].name);

    // Change their vote to the second player
    await submitMomVote(matchKey, testPlayers[1].name, testVoterId);
    console.log(`✓ Updated vote to: ${testPlayers[1].name}`);

    const resultsAfterUpdate = await getMomVoteResults(matchKey);
    console.log('Results after vote update:', resultsAfterUpdate);

    // Verify total vote count hasn't changed
    const totalVotesAfterUpdate = resultsAfterUpdate.reduce((sum, r) => sum + Number(r.vote_count), 0);
    console.log(`Total votes: ${totalVotes} (should be same as before: ${totalVotes})`);

    console.log('\n=== Test Complete ===\n');

    return NextResponse.json({
      success: true,
      testData: {
        matchKey,
        totalVotes,
        testPlayers,
        resultsBeforeReveal: {
          revealed: revealedBefore,
          results: resultsBeforeReveal,
        },
        resultsAfterReveal: {
          revealed: revealedAfter,
          results: resultsAfterReveal,
        },
        resultsAfterUpdate: {
          totalVotes: totalVotesAfterUpdate,
          votesMatchExpected: totalVotesAfterUpdate === totalVotes,
          results: resultsAfterUpdate,
        },
      },
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    );
  }
}
