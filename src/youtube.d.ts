// Type definitions for YouTube IFrame API
interface YT {
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
  Player: {
    new (
      elementId: string | HTMLElement,
      options: {
        videoId?: string;
        width?: number | string;
        height?: number | string;
        playerVars?: {
          autoplay?: 0 | 1;
          cc_load_policy?: 1;
          color?: 'red' | 'white';
          controls?: 0 | 1 | 2;
          disablekb?: 0 | 1;
          enablejsapi?: 0 | 1;
          end?: number;
          fs?: 0 | 1;
          hl?: string;
          iv_load_policy?: 1 | 3;
          list?: string;
          listType?: 'playlist' | 'search' | 'user_uploads';
          loop?: 0 | 1;
          modestbranding?: 0 | 1;
          origin?: string;
          playlist?: string;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          showinfo?: 0 | 1;
          start?: number;
          mute?: 0 | 1;
        };
        events?: {
          onReady?: (event: { target: YT.Player }) => void;
          onStateChange?: (event: { target: YT.Player; data: number }) => void;
          onPlaybackQualityChange?: (event: { target: YT.Player; data: string }) => void;
          onPlaybackRateChange?: (event: { target: YT.Player; data: number }) => void;
          onError?: (event: { target: YT.Player; data: number }) => void;
          onApiChange?: (event: { target: YT.Player }) => void;
        };
      }
    ): YT.Player;
  };
}

interface Player {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  clearVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  setSize(width: number, height: number): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate: number): void;
  getAvailablePlaybackRates(): number[];
  getPlaybackQuality(): string;
  setPlaybackQuality(suggestedQuality: string): void;
  getAvailableQualityLevels(): string[];
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getOptions(): string[];
  getOption(option: string): any;
  loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
  cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
  loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void;
  cuePlaylist(playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void;
  destroy(): void;
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: (() => void) | null;
}// Type definitions for YouTube IFrame API
interface YT {
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
  Player: {
    new (
      elementId: string | HTMLElement,
      options: {
        videoId?: string;
        width?: number | string;
        height?: number | string;
        playerVars?: {
          autoplay?: 0 | 1;
          cc_load_policy?: 1;
          color?: 'red' | 'white';
          controls?: 0 | 1 | 2;
          disablekb?: 0 | 1;
          enablejsapi?: 0 | 1;
          end?: number;
          fs?: 0 | 1;
          hl?: string;
          iv_load_policy?: 1 | 3;
          list?: string;
          listType?: 'playlist' | 'search' | 'user_uploads';
          loop?: 0 | 1;
          modestbranding?: 0 | 1;
          origin?: string;
          playlist?: string;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          showinfo?: 0 | 1;
          start?: number;
          mute?: 0 | 1;
        };
        events?: {
          onReady?: (event: { target: YT.Player }) => void;
          onStateChange?: (event: { target: YT.Player; data: number }) => void;
          onPlaybackQualityChange?: (event: { target: YT.Player; data: string }) => void;
          onPlaybackRateChange?: (event: { target: YT.Player; data: number }) => void;
          onError?: (event: { target: YT.Player; data: number }) => void;
          onApiChange?: (event: { target: YT.Player }) => void;
        };
      }
    ): YT.Player;
  };
}

interface Player {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  clearVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  setSize(width: number, height: number): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate: number): void;
  getAvailablePlaybackRates(): number[];
  getPlaybackQuality(): string;
  setPlaybackQuality(suggestedQuality: string): void;
  getAvailableQualityLevels(): string[];
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getOptions(): string[];
  getOption(option: string): any;
  loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
  cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
  loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void;
  cuePlaylist(playlist: string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void;
  destroy(): void;
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: (() => void) | null;
}