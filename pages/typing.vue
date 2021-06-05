<template>
  <main>
    <div class="info" v-if="doing">あと {{ indexes.length + 1 }}</div>
    <div :class="{ display: true, doing }">
      <span class="typed">{{ typed }}</span
      ><span class="text">{{ will_typing }}</span>
    </div>
    <div class="keyboard">
      <ul v-for="(keys, j) in key_labels" :key="j">
        <li
          v-for="(key, i) in keys"
          :key="i"
          :class="{
            pressed: pressed.includes(key.code),
            ['key_' + key.code]: true,
          }"
        >
          {{ key.label }}
        </li>
      </ul>
    </div>
    <div class="histories">
      <h3>履歴</h3>
      <ul>
        <li v-for="(history, i) in histories" :key="i">{{history}}</li>
      </ul>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
const PROMPT = "スペースキーで開始します";
class Record {
  constructor(
    public text: string,
    public start: Date,
    public duration: number,
    public miss_count: number = 0
  ) {}
}
class Key {
  constructor(public label: string, public code: string) {}
  static from(...pairs: string[]): Key[] {
    return pairs.map((i) => {
      const pair = i.split("\t");
      const code =
        pair.length > 1
          ? pair[1]
          : (isNaN(Number(pair[0])) ? "Key" : "Digit") + pair[0];
      return new Key(pair[0], code);
    });
  }
}
export type Data = {
  typed: string;
  text: string;
  key_labels: Key[][];
  pressed: string[];
  words: string[];
  indexes: number[];
  records: Record[];
  doing: boolean;
  start: Date;
  histories: string[];
};
export default Vue.extend({
  data(): Data {
    return {
      typed: "",
      text: PROMPT,
      key_labels: [
        Key.from(
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "0",
          "-\tMinus",
          "^\tEqual",
          "\\\tIntlYen",
          "←\tBackspace"
        ),
        Key.from(
          "Q",
          "W",
          "E",
          "R",
          "T",
          "Y",
          "U",
          "I",
          "O",
          "P",
          "@\tBracketLeft",
          "[\tBracketRight",
          "Enter\tEnter"
        ),
        Key.from(
          "A",
          "S",
          "D",
          "F",
          "G",
          "H",
          "J",
          "K",
          "L",
          ";\tSemicolon",
          ":\tQuote",
          "]\tBackslash"
        ),
        Key.from(
          "Shift\tShiftLeft",
          "Z",
          "X",
          "C",
          "V",
          "B",
          "N",
          "M",
          ",\tComma",
          ".\tPeriod",
          "/\tSlash",
          "_\tIntlRo",
          "Shift\tShiftRight"
        ),
        Key.from(" \tSpace"),
      ],
      pressed: [],
      words: [],
      indexes: [],
      records: [],
      doing: false,
      start: new Date(),
      histories: []
    };
  },
  async fetch() {
    this.words = ((await this.$axios.$get("https://pumi.tech/api/words", {
      headers: {
        "Content-Type": "text/plain",
      },
      responseType: "text",
    })) as string)
      .split(/\r?\n/)
      .filter((i) => i.trim().length > 0);
  },
  mounted() {
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
      return this.key_labels.flat();
    },
    will_typing(): string {
      return this.text.substr(this.typed.length);
    },
  },
  methods: {
    keydown(e: KeyboardEvent) {
      if (!this.doing && e.key == " ") {
        this.indexes = Array.from(Array(this.words.length)).map((_, i) => i);
        // for (let i = 0; i < this.words.length; i++) {
        //   const j = Math.floor(Math.random() * this.words.length);
        //   const n = this.indexes[j];
        //   this.indexes[j] = this.indexes[i];
        //   this.indexes[i] = n;
        // }
        this.next();
        this.start = new Date();
        this.doing = true;
      }
      const key = this.keys.find((i) => i.code == e.code);
      if (key != null) {
        this.pressed.push(key.code);
        if (this.will_typing.charAt(0) == e.key)
          this.typed = this.typed + e.key;
        if (this.typed == this.text) this.next();
      }
    },
    keyup(e: KeyboardEvent) {
      const index = this.pressed.indexOf(e.code);
      if (index >= 0) {
        this.pressed.splice(index, 1);
      }
    },
    next() {
      this.typed = "";
      if (this.indexes.length <= 0) {
        const end = new Date();
        const duration = end.getTime() - this.start.getTime();
        const seconds = Math.floor(duration / 1000);
        const ms = ('000' + duration % 1000).slice(-3);
        this.histories.push(`[${this.start.toLocaleString()}] ${this.words.length}単語 ${seconds}.${ms} 秒`);
        this.doing = false;
        this.text = PROMPT;
      } else {
        this.text = this.words[this.indexes.shift()!];
      }
    },
  },
});
</script>

<style lang="scss" scoped>
main {
  margin: 1em auto;
  display: table;
  .info {
    text-align: center;
  }
  .display {
    font-size: 5rem;
    padding: 2em 0;
    text-align: center;
    .typed {
      color: #aaa;
    }
    &.doing {
      text-align: left;
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
          width: 19em;
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
}
</style>