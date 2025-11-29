
export class AudioService {
  private static instance: AudioService;
  private context: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public getContext(): AudioContext {
    if (!this.context || this.context.state === 'closed') {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  public close(): void {
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }
    this.context = null;
  }
}

export const audioService = AudioService.getInstance();
