<!--
# タイピング練習
* キーボード表示
* 押されたキーのハイライト
* 入力単語の表示
* 入力判定
* 複数単語対応
* 残り単語数表示
* 履歴登録
* 速度計測
* 効果音追加
* 間違い単語表示
* 複数コース対応
* 間違い単語選択練習
* ローマ字対応
* 入力ヒント
* キーハイライト
todo
* 促音対応
* 基礎スキップ
--><template>
  <main v-if="course">
    <div class="info">
      <h1 class="course">
        Step {{ courses.indexOf(course) + 1 }} {{ course.subject }}({{
          course.words.length
        }})
      </h1>
      <div class="progress" v-if="doing">あと {{ indexes.length + 1 }}</div>
    </div>
    <template v-if="keyboard.keymaps.length > 0">
      <div :class="{ display: true, doing }">
        <template v-if="doing">
          <span class="typed">{{ typed }}</span
          ><span class="will_typing">{{ will_typing }}</span>
        </template>
        <span v-else>スペースキーで開始します</span>
        <div class="hint">{{ text != hint ? hint : "　" }}</div>
      </div>
      <div class="keyboard">
        <ul v-for="(keys, j) in keyboard.keymaps" :key="j">
          <li v-for="(key, i) in keys" :key="i" :class="key_class(key)">
            {{ key.label }}
          </li>
        </ul>
      </div>
      <div class="histories">
        <h3>履歴（クリックすると間違い単語の練習ができます）</h3>
        <span class="miss_word">ミスした単語</span>
        <ul>
          <li
            v-for="(history, i) in histories"
            :key="i"
            :class="{ clickable: history.miss_words.length > 0 }"
            @click="history.miss_words.length > 0 ? review(history) : void 0"
          >
            {{ history }}
            <ul class="miss_words">
              <li
                v-for="(word, j) in history.miss_words"
                :key="j"
                class="miss_word"
              >
                {{ word }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </template>
    <div class="alert" v-if="alert.length > 0">
      <form class="popup" @submit.prevent="alert = ''">
        <p>{{ alert }}</p>
        <button type="submit"><font-awesome-icon icon="times" /></button>
      </form>
    </div>
  </main>
  <main v-else>Now Loading...</main>
</template>

<script lang="ts">
import Vue from "vue";

class Record {
  constructor(
    public text: string,
    public start: Date = new Date(),
    public typed: string = "",
    public end: Date = new Date()
  ) {}
  get duration() {
    return this.end.getTime() - this.start.getTime();
  }
  get miss_count() {
    return this.typed.length - this.text.length;
  }
  static from(o: { [P in keyof Record]: Record[P] }) {
    return new Record(o.text, new Date(o.start), o.typed, new Date(o.end));
  }
  toJSON() {
    return {
      text: this.text,
      start: this.start,
      typed: this.typed,
      end: this.end,
    };
  }
}

class History {
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

class Key {
  constructor(
    public label: string,
    public code: number,
    public clazz?: string
  ) {}
  toJSON() {
    return { label: this.label, code: this.code, clazz: this.clazz };
  }
}

type Handler = (code: number, key: string) => void;
class Keyboard {
  handler?: Handler;
  keymaps: Key[][] = [];
  pressed: number[] = [];
  translators: { to: string; froms: string[] }[] = [];
  attach(target: Element | Document) {
    target.addEventListener("keydown", this.keydown as (e: Event) => void);
    target.addEventListener("keyup", this.keyup as (e: Event) => void);
  }
  detach(target: Element | Document) {
    target.removeEventListener("keydown", this.keydown as (e: Event) => void);
    target.removeEventListener("keyup", this.keyup as (e: Event) => void);
  }
  keydown = (e: KeyboardEvent) => {
    e.preventDefault();
    if (!this.pressed.includes(e.keyCode)) {
      this.pressed.push(e.keyCode);
    }
    if (this.handler) {
      this.handler(e.keyCode, e.key);
    }
  };
  keyup = (e: KeyboardEvent) => {
    e.preventDefault();
    const index = this.pressed.indexOf(e.keyCode);
    if (index >= 0) {
      this.pressed.splice(index, 1);
    }
  };
  set onpress(handler: Handler) {
    this.handler = handler;
  }
  is_pressed(code: number) {
    return this.pressed.includes(code);
  }
  is_valid(code: number) {
    return this.keymaps.flat().find((i) => i.code == code) != null;
  }
  load(keymap: string, romaji: string = "") {
    this.keymaps = keymap.split(/\r?\n/).map((line: string) =>
      line.split("\t").map((item) => {
        const [label, code, clazz] = item.split("|");
        return new Key(label, Number(code), clazz);
      })
    );
    if (romaji.length > 0) {
      this.translators = romaji.split(/\r?\n/).map((line: string) => {
        const [to, ...froms] = line.split("\t");
        return { to, froms };
      });
    }
  }
  match(expected: string, input: string) {
    const candidates = this.translators.filter((i) =>
      expected.startsWith(i.to)
    );
    let result = { from: "", to: "" };
    candidates.forEach((i) => {
      const froms = i.froms.filter((j) => input.endsWith(j));
      if (froms.length > 0) {
        const from = froms.reduce((a, b) => (a.length > b.length ? a : b));
        if (from != null && i.to.length > result.to.length) {
          result.from = from;
          result.to = i.to;
        }
      }
    });
    return result.from.length ? result : null;
  }
  hint(word: string) {
    const result = [];
    while (word.length > 0) {
      if (
        /[- ^\\@[;:\],./!"#$%&'()=~|`{+*}<>?_0-9a-zA-Z]/.test(word.charAt(0))
      ) {
        result.push(word.charAt(0));
        word = word.substr(1);
        continue;
      }
      const translator = this.translators
        .filter((i) => word.startsWith(i.to))
        .sort((a, b) => b.to.length - a.to.length)[0];
      const letter = translator.froms[0];
      result.push(letter);
      word = word.substr(translator.to.length);
    }
    return result.join("");
  }
}

class Course {
  constructor(
    public subject: string,
    public words: string[],
    public limit_keys?: Key[]
  ) {}
  toJSON() {
    return { subject: this.subject, words: this.words };
  }
}

type Data = {
  keyboard: Keyboard;
  typed: string;
  text: string;
  indexes: number[];
  records: Record[];
  doing: boolean;
  histories: History[];
  courses: Course[];
  course_index: number;
  alert: string;
  audio: HTMLAudioElement | null;
  review_course: Course | null;
};

export default Vue.extend({
  data(): Data {
    return {
      keyboard: new Keyboard(),
      typed: "",
      text: "",
      indexes: [],
      records: [],
      doing: false,
      histories: [],
      courses: [],
      course_index: 0,
      alert: "",
      audio: null,
      review_course: null,
    };
  },
  async fetch() {
    const options = {
      headers: {
        Accept: "text/plain",
      },
      responseType: "text",
    };
    const [keymaps, romaji] = await Promise.all([
      this.$axios.$get("/api/typing/keymaps", options),
      this.$axios.$get("/api/typing/romaji", options),
    ]);
    this.keyboard.load(keymaps, romaji);
    this.courses = (
      await Promise.all(
        (await this.$axios.$get("/api/typing/index", options))
          .split(/\r?\n/)
          .map(async (line: string) => {
            let [subject, ...words] = line.split("\t");
            if (subject.startsWith("#")) return;
            if (words.length == 1) {
              words = (await this.$axios.$get(words[0], options))
                .split(/\r?\n/)
                .filter((i: string) => i.trim().length > 0);
            }
            let limit_keys: Key[] | undefined = undefined;
            if (subject.startsWith("|")) {
              limit_keys = words
                .map(
                  (i) =>
                    this.keyboard.keymaps
                      .flat()
                      .find((j) => j.label.toLowerCase() == i)!
                )
                .filter((i) => i != null);
              subject = subject.substr(1);
            }
            return new Course(subject, words, limit_keys);
          })
      )
    ).filter((i) => i != null) as Course[];
  },
  fetchOnServer: false,
  created() {
    this.$nuxt.$emit("sidebar_disabled", true);
  },
  mounted() {
    this.audio = new Audio("/type.mp3");
    this.histories =
      (localStorage.typing__histories &&
        JSON.parse(localStorage.typing__histories).map(History.from)) ||
      [];
    this.keyboard.attach(document);
    this.keyboard.onpress = this.onpress;
  },
  beforeDestroy() {
    this.keyboard.detach(document);
  },
  computed: {
    will_typing(): string {
      return this.text.substr(this.typed.length);
    },
    record(): Record {
      return this.records[this.records.length - 1];
    },
    course(): Course {
      return this.review_course
        ? this.review_course
        : this.courses[this.course_index];
    },
    hint(): string {
      return this.keyboard.hint(this.text);
    },
  },
  watch: {
    histories(value: History[]) {
      localStorage && (localStorage.typing__histories = JSON.stringify(value));
    },
  },
  methods: {
    next() {
      this.typed = "";
      if (this.record) {
        this.record.end = new Date();
      }
      if (this.indexes.length <= 0) {
        this.doing = false;
        this.histories.push(new History(this.course.subject, this.records));
        if (this.course_index + 1 < this.courses.length) {
          this.course_index++;
        } else {
          if (this.review_course === this.course) {
            const miss_words = this.histories.slice(-1)[0].miss_words;
            if (miss_words.length > 0) {
              this.review_course = new Course("再復習", miss_words);
            } else {
              this.alert = "おめでとうございます！全ステップをクリアしました！";
              this.review_course = null;
              this.course_index = 0;
            }
          } else {
            this.review_course = new Course("総復習", [
              ...new Set(this.histories.flatMap((i) => i.miss_words)),
            ]);
          }
        }
        this.records = [];
        this.text = "";
      } else {
        this.text = this.course.words[this.indexes.shift()!];
        this.records.push(new Record(this.text));
      }
    },
    setup(shuffle: boolean) {
      this.indexes = Array.from(Array(this.course.words.length)).map(
        (_, i) => i
      );
      if (!shuffle) return;
      for (let i of this.indexes) {
        const j = Math.floor(Math.random() * this.course.words.length);
        [this.indexes[j], this.indexes[i]] = [this.indexes[i], this.indexes[j]];
      }
    },
    onpress(code: number, key: string) {
      if (this.alert.length > 0) {
        this.alert = "";
        return;
      }
      this.audio?.play();
      if (!this.doing && code == 32) {
        this.setup(true);
        this.next();
        this.doing = true;
        return;
      }
      if (this.keyboard.is_valid(code)) {
        if (code == 8) {
          if (this.typed.length > 0) {
            this.typed = this.typed.slice(0, -1);
          }
          return;
        }
        if (!this.doing) return;
        this.record.typed += key;
        if (this.will_typing.charAt(0) == key) {
          this.typed += key;
        } else {
          const matched = this.keyboard.match(
            this.will_typing,
            this.record.typed
          );
          if (matched) {
            this.typed += matched.to;
            this.record.typed =
              this.record.typed.slice(0, -matched.from.length) + matched.to;
          }
        }
        if (this.typed == this.text) {
          this.record.text = this.text;
          this.next();
        }
      }
    },
    review(history: History) {
      if (this.doing) {
        this.alert = "終了してからです";
        return;
      }
      this.review_course = new Course(
        `${history.start.toLocaleString()}の復習`,
        history.miss_words.flatMap((i) => [i, i])
      );
    },
    key_class(key: Key) {
      const result: { [index: string]: boolean } = {
        pressed: this.keyboard.is_pressed(key.code),
      };
      if (key.clazz) {
        result["key_" + key.clazz] = true;
      }
      if (
        this.course.limit_keys &&
        this.course.limit_keys.find((i) => i.code == key.code)
      ) {
        result["hilight"] = true;
      }
      return result;
    },
  },
});
</script>

<style lang="scss" scoped>
main {
  margin: 1em auto;
  display: table;
  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .progress {
      text-align: right;
    }
  }
  .display {
    font-size: 5rem;
    padding: 2em 0;
    text-align: center;
    .typed {
      color: #aaa;
      padding: 0 0 0 1em;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    .will_typing {
      padding: 0 1em 0 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    .hint {
      font-size: 3rem;
    }
  }
  .keyboard {
    > :nth-child(2) {
      margin-left: 2em;
    }
    > :nth-child(3) {
      margin-left: 3em;
    }
    > :nth-child(5) {
      margin-left: 14em;
    }
    ul {
      display: flex;
      padding: 0;
      list-style-type: none;
      position: relative;
      li {
        border: 1px solid #ddd;
        width: 4em;
        line-height: 4em;
        min-height: 4em;
        text-align: center;
        margin: 0.1rem;
        &.pressed {
          background-color: #faa;
          transform: translateY(0.1rem);
        }
        &.key_Space {
          width: 19.8em;
        }
        &.key_ShiftLeft {
          width: 5em;
        }
        &.key_ShiftRight {
          width: 7.2em;
        }
        &.key_Enter {
          position: absolute;
          right: 0;
          width: 6.2em;
          height: 8.5em;
          border-left: none;
          border-bottom: none;
        }
        &.hilight {
          border-color: yellow;
        }
      }
    }
  }
  .histories {
    margin-top: 1rem;
    max-height: 30rem;
    overflow: auto;
    > ul {
      display: flex;
      flex-direction: column-reverse;
      width: 70rem;
    }
    .miss_words {
      display: flex;
      flex-wrap: wrap;
      list-style-type: none;
      padding: 0;
    }
    .miss_word {
      padding: 0rem 1rem;
      border-radius: 0.5em;
      background-color: #faa;
      color: red;
      margin: 0.1rem;
    }
  }
  .alert {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    .popup {
      background-color: white;
      color: #333;
      border-radius: 1em;
      padding: 1em;
      position: relative;
      margin-bottom: 5rem;
      button {
        position: absolute;
        top: -2rem;
        right: -2rem;
        width: 3rem;
        height: 3rem;
      }
    }
  }
  .clickable {
    cursor: pointer;
  }
}
</style>