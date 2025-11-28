
import { getFantasyLeague } from '../lib/fantasy-processor';

async function main() {
  try {
    console.log('Fetching fantasy league...');
    const teams = await getFantasyLeague();
    console.log(`Successfully fetched ${teams.length} teams.`);
    console.log('Top team:', teams[0]);
  } catch (error) {
    console.error('Error fetching fantasy league:', error);
  }
}

main();
