export enum Page {
    Home = 'Home',
    SearchResults = 'SearchResults',
    MyVideos = 'MyVideos',
}

export interface Video {
    id: string;
    type: 'video' | 'playlist';
    title: string;
    channel: string;
    thumbnailUrl: string;
    uploaded: string;
}

export interface UploadedVideo {
    id: string;
    type: 'uploaded';
    title: string;
    description: string;
    publicUrl: string; // Public URL from S3
    fileKey: string; // Key in the S3 bucket
    fileName: string;
    fileType: string;
    uploadedAt: string;
}
