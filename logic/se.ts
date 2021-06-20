export class SE {
    buffer?: AudioBuffer;
    constructor(public url: string, protected context = new AudioContext()) {
      const request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      request.onload = async () =>
        (this.buffer = await this.context.decodeAudioData(request.response));
      request.send();
    }
    async play() {
      if (!this.buffer) return;
      if (this.context.state == "suspended") {
        await this.context.resume();
      }
      const source = this.context.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.context.destination);
      source.start(0);
    }
  }
  