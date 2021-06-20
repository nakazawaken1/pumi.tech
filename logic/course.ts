import { Key } from "~/logic/keyboard";

export class Course {
  static async load(course_index: string, keymaps: Key[], http_get: (url: string) => string): Promise<Course[]> {
    return (await Promise.all(course_index.split(/\r?\n/)
      .map(async (line: string) => {
        let [subject, ...words] = line.split("\t");
        let kanas = words;
        if (subject.startsWith("#")) return;
        if (words.length == 1) {
          const items = (await http_get(words[0]))
            .split(/\r?\n/)
            .filter((i: string) => i.trim().length > 0)
            .map(i => i.split("\t"));
          words = items.map(i => i[0]);
          kanas = items.map(i => i[1] || i[0]);
        }
        let limit_keys: Key[] | undefined = undefined;
        if (subject.startsWith("|")) {
          limit_keys = words
            .map((i) => keymaps.find((j) => j.label.toLowerCase() == i)!)
            .filter((i) => i != null);
          subject = subject.substr(1);
        }
        return new Course(subject, words, kanas, limit_keys);
      })
    )
    ).filter((i) => i != null) as Course[];
  }
  constructor(
    public subject: string,
    public words: string[],
    public kanas: string[] = words,
    public limit_keys?: Key[]
  ) { console.log(this) }
  get length() {
    return this.words.length;
  }
  toJSON() {
    return { subject: this.subject, words: this.words, kanas: this.kanas };
  }
}
