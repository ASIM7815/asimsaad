
import { Video } from '../types';
import { YOUTUBE_API_KEY, YOUTUBE_API_BASE_URL, WHAT_IS_QUERIES, HOW_TO_QUERIES, FREE_COURSES_QUERIES } from '../constants';

const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const processApiData = (data: any): Video[] => {
    if (!data.items) return [];
    return data.items.map((item: any) => ({
        type: item.id.kind === 'youtube#video' ? 'video' : 'playlist',
        id: item.id.videoId || item.id.playlistId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        uploaded: `Published on ${new Date(item.snippet.publishedAt).toLocaleDateString()}`
    }));
}

export const searchYouTube = async (query: string): Promise<Video[]> => {
    const url = `${YOUTUBE_API_BASE_URL}?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return processApiData(data);
};

const fetchSection = async (queries: string[], type: 'video' | 'playlist' = 'video'): Promise<Video[]> => {
    const shuffledQueries = shuffleArray([...queries]);
    const selectedQueries = shuffledQueries.slice(0, 6);
    const combinedQuery = selectedQueries.join(' | ');
    const url = `${YOUTUBE_API_BASE_URL}?part=snippet&maxResults=30&q=${encodeURIComponent(combinedQuery)}&type=${type}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const allItems = processApiData(data);
    return shuffleArray(allItems).slice(0, 6);
}

export const fetchHomePageSections = async (): Promise<Record<string, Video[]>> => {
    const [whatIs, howTo, courses] = await Promise.all([
        fetchSection(WHAT_IS_QUERIES, 'video'),
        fetchSection(HOW_TO_QUERIES, 'video'),
        fetchSection(FREE_COURSES_QUERIES, 'playlist')
    ]);

    return { whatIs, howTo, courses };
};
