export class Record {
    constructor(
      public text: string,
      public start: Date = new Date(),
      public typed: string = "",
      public raw_typed: string = "",
      public end: Date = new Date()
    ) {}
    get duration() {
      return this.end.getTime() - this.start.getTime();
    }
    get miss_count() {
      return this.typed.length - this.text.length;
    }
    static from(o: { [P in keyof Record]: Record[P] }) {
      return new Record(o.text, new Date(o.start), o.typed, o.raw_typed, new Date(o.end));
    }
    toJSON() {
      return {
        text: this.text,
        start: this.start,
        typed: this.typed,
        raw_typed: this.raw_typed,
        end: this.end,
      };
    }
  }
  
  export class History {
    miss_words: string[];
    constructor(public subject: string, public records: Record[]) {
      this.miss_words = [
        ...new Set(
          this.records.filter((i) => i.text != i.typed).map((i) => i.text)
        ),
      ];
    }
    toString() {
      const duration = this.records.reduce((p, c) => p + c.duration, 0);
      const seconds = Math.floor(duration / 1000);
      const ms = ("000" + (duration % 1000)).slice(-3);
      const typed_count = this.records.reduce((p, c) => p + c.typed.length, 0);
      const text_count = this.records.reduce((p, c) => p + c.text.length, 0);
      const speed = text_count / (duration / 1000);
      return `[${this.start.toLocaleString()}] ${this.subject}(${
        this.records.length
      }) ${seconds}.${ms} 秒 タイプ数 ${typed_count} ミス数 ${
        typed_count - text_count
      } 速度 ${Math.floor(speed)}.${("00" + Math.floor(speed * 100)).slice(
        -2
      )} 文字/秒`;
    }
    get start() {
      return this.records[0].start;
    }
    static from(json: { [P in keyof History]: History[P] }) {
      return new History(json.subject, json.records.map(Record.from));
    }
    toJSON() {
      return { subject: this.subject, records: this.records };
    }
  }
  