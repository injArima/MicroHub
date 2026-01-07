
import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('output.json', 'utf8'));

// Logic from movieService.ts
let episodeCount = undefined;
if (data.main?.episodes?.totalEpisodes?.total) {
    episodeCount = data.main.episodes.totalEpisodes.total;
} else if (data.main?.episodes?.episodes?.total) {
    episodeCount = data.main.episodes.episodes.total;
}

console.log("Extracted Episode Count:", episodeCount);
