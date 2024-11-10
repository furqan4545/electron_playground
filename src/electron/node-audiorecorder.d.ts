declare module "node-audiorecorder" {
  class AudioRecorder {
    constructor(options?: any);
    start(): void;
    stop(): void;
    stream(): NodeJS.ReadableStream;
  }
  export default AudioRecorder;
}
