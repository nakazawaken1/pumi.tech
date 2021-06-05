<template>
  <main>
    <div class="info" v-if="doing">あと {{ indexes.length + 1 }}</div>
    <div :class="{ display: true, doing }">
      <template v-if="doing">
        <span class="typed">{{ typed }}</span
        ><span class="text">{{ will_typing }}</span>
      </template>
      <span v-else>スペースキーで開始します</span>
    </div>
    <div class="keyboard">
      <ul v-for="(keys, j) in key_layouts" :key="j">
        <li v-for="(key, i) in keys" :key="i" :class="key_class(key)">
          {{ key.label }}
        </li>
      </ul>
    </div>
    <div class="histories">
      <h3>履歴</h3>
      <span class="miss_word">ミスした単語</span>
      <ul>
        <li v-for="(history, i) in histories" :key="i">
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
  </main>
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
  constructor(public records: Record[]) {}
  get miss_words() {
    return this.records.filter((i) => i.text != i.typed).map((i) => i.text);
  }
  toString() {
    const duration = this.records.reduce((p, c) => p + c.duration, 0);
    const seconds = Math.floor(duration / 1000);
    const ms = ("000" + (duration % 1000)).slice(-3);
    const typed_count = this.records.reduce((p, c) => p + c.typed.length, 0);
    const text_count = this.records.reduce((p, c) => p + c.text.length, 0);
    const speed = text_count / (duration / 1000);
    return `[${this.records[0].start.toLocaleString()}] ${
      this.records.length
    }単語 ${seconds}.${ms} 秒 タイプ数 ${typed_count} ミス数 ${
      typed_count - text_count
    } 速度 ${Math.floor(speed)}.${("00" + Math.floor(speed * 100)).slice(
      -2
    )} 文字/秒`;
  }
  static from(json: { records: { [P in keyof Record]: Record[P] }[] }) {
    return new History(json.records.map(Record.from));
  }
  toJSON() {
    return { records: this.records };
  }
}
class Key {
  constructor(
    public label: string,
    public code: number,
    public clazz?: string
  ) {}
  static from(...pairs: string[]): Key[] {
    return pairs.map((i) => {
      const a = i.split("\t");
      return new Key(a[0], Number(a[1]), a[2]);
    });
  }
  toJSON() {
    return { label: this.label, code: this.code, clazz: this.clazz };
  }
}
export type Data = {
  typed: string;
  text: string;
  key_layouts: readonly Key[][];
  pressed: number[];
  words: string[];
  indexes: number[];
  records: Record[];
  doing: boolean;
  histories: History[];
};
export default Vue.extend({
  data(): Data {
    return {
      typed: "",
      text: "",
      key_layouts: [
        Key.from(
          "1\t49",
          "2\t50",
          "3\t51",
          "4\t52",
          "5\t53",
          "6\t54",
          "7\t55",
          "8\t56",
          "9\t57",
          "0\t48",
          "-\t189",
          "^\t222",
          "\\\t220",
          "←\t8"
        ),
        Key.from(
          "Q\t81",
          "W\t87",
          "E\t69",
          "R\t82",
          "T\t84",
          "Y\t89",
          "U\t85",
          "I\t73",
          "O\t79",
          "P\t80",
          "@\t192",
          "[\t219",
          "Enter\t13\tEnter"
        ),
        Key.from(
          "A\t65",
          "S\t83",
          "D\t68",
          "F\t70",
          "G\t71",
          "H\t72",
          "J\t74",
          "K\t75",
          "L\t76",
          ";\t187",
          ":\t186",
          "]\t221"
        ),
        Key.from(
          "Shift\t16\tShiftLeft",
          "Z\t90",
          "X\t88",
          "C\t67",
          "V\t86",
          "B\t66",
          "N\t78",
          "M\t77",
          ",\t188",
          ".\t190",
          "/\t191",
          "_\t226",
          "Shift\t16\tShiftRight"
        ),
        Key.from(" \t32\tSpace"),
      ],
      pressed: [],
      words: ["abc", "def"],
      indexes: [],
      records: [],
      doing: false,
      histories: [],
    };
  },
  async fetch() {
    this.words = (
      await this.$axios.$get("https://pumi.tech/api/words", {
        headers: {
          "Content-Type": "text/plain",
        },
        responseType: "text",
      })
    )
      .split(/\r?\n/)
      .filter((i: string) => i.trim().length > 0);
  },
  mounted() {
    this.histories =
      (localStorage.typing__histories &&
        JSON.parse(localStorage.typing__histories).map(History.from)) ||
      [];
    this.$nuxt.$emit("sidebar_disabled", true);
    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keydown);
    document.removeEventListener("keyup", this.keyup);
  },
  computed: {
    keys(): Key[] {
      return this.key_layouts.flat();
    },
    will_typing(): string {
      return this.text.substr(this.typed.length);
    },
    record(): Record {
      return this.records[this.records.length - 1];
    },
  },
  methods: {
    keydown(e: KeyboardEvent) {
      console.log(e);
      e.preventDefault();
      if (!this.doing && e.keyCode == 32) {
        this.indexes = Array.from(Array(this.words.length)).map((_, i) => i);
        for (let i of this.indexes) {
          const j = Math.floor(Math.random() * this.words.length);
          [this.indexes[j], this.indexes[i]] = [
            this.indexes[i],
            this.indexes[j],
          ];
        }
        this.next();
        this.doing = true;
        return;
      }
      const key = this.keys.find((i) => i.code == e.keyCode);
      if (key != null) {
        this.pressed.push(key.code);
        if (!this.doing) return;
        this.record.typed += e.key;
        if (this.will_typing.charAt(0) == e.key) {
          this.typed = this.typed + e.key;
        }
        if (this.typed == this.text) {
          this.record.text = this.text;
          this.next();
        }
      }
    },
    keyup(e: KeyboardEvent) {
      e.preventDefault();
      const index = this.pressed.indexOf(e.keyCode);
      if (index >= 0) {
        this.pressed.splice(index, 1);
      }
    },
    next() {
      this.typed = "";
      if (this.record) this.record.end = new Date();
      if (this.indexes.length <= 0) {
        this.doing = false;
        this.histories.push(new History(this.records));
        this.records = [];
        this.text = "";
      } else {
        this.text = this.words[this.indexes.shift()!];
        this.records.push(new Record(this.text));
      }
    },
    key_class(key: Key) {
      const result: { [index: string]: boolean } = {
        pressed: this.pressed.includes(key.code),
      };
      if (key.clazz) result["key_" + key.clazz] = true;
      return result;
    },
  },
  watch: {
    histories(value: History[]) {
      localStorage && (localStorage.typing__histories = JSON.stringify(value));
    },
  },
});
</script>

<style lang="scss" scoped>
main {
  margin: 1em auto;
  display: table;
  .info {
    text-align: right;
  }
  .display {
    font-size: 5rem;
    padding: 2em 0;
    text-align: center;
    &.doing {
      text-align: left;
    }
    .typed {
      color: #aaa;
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
      }
    }
  }
  .histories {
    max-height: 30rem;
    overflow: auto;
    > ul {
      display: flex;
      flex-direction: column-reverse;
    }
    .miss_words {
      display: flex;
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
}
</style>