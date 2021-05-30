<template>
  <main>
    <div class="display">
      <span class="typed">{{ typed }}</span
      ><span class="text">{{ will_typing }}</span>
    </div>
    <div class="keyboard">
      <ul>
        <li
          v-for="(key, i) in keys1"
          :key="i"
          :class="{ pressed: pressed.includes(key) }"
        >
          {{ key }}
        </li>
      </ul>
      <ul>
        <li
          v-for="(key, i) in keys2"
          :key="i"
          :class="{ pressed: pressed.includes(key) }"
        >
          {{ key }}
        </li>
      </ul>
      <ul>
        <li
          v-for="(key, i) in keys3"
          :key="i"
          :class="{ pressed: pressed.includes(key) }"
        >
          {{ key }}
        </li>
      </ul>
      <ul>
        <li
          v-for="(key, i) in keys4"
          :key="i"
          :class="{ pressed: pressed.includes(key) }"
        >
          {{ key }}
        </li>
      </ul>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
export type Data = {
  typed: string;
  text: string;
  keys1: string[];
  keys2: string[];
  keys3: string[];
  keys4: string[];
  pressed: string[];
  words: string[];
  indexes: number[];
};
export default Vue.extend({
  data(): Data {
    return {
      typed: "",
      text: "abcdefghijklmnopqrstuvwxyz",
      keys1: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "^", "\\"],
      keys2: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "@", "["],
      keys3: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", ":", "]"],
      keys4: ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "_"],
      pressed: [],
      words: [],
      indexes: [],
    };
  },
  async fetch() {
    this.words = ((await this.$axios.$get("/api/words", {
      headers: {
        "Content-Length": 0,
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
    keys(): string[] {
      return this.keys1.concat(this.keys2, this.keys3, this.keys4);
    },
    will_typing(): string {
      return this.text.substr(this.typed.length);
    },
  },
  methods: {
    keydown(e: KeyboardEvent) {
      this.if_exists(this.keys, e.key.toUpperCase(), (index, value) => {
        this.pressed.push(value);
        if (this.will_typing.charAt(0) == e.key)
          this.typed = this.typed + e.key;
        if (this.typed == this.text) this.next();
      });
    },
    keyup(e: KeyboardEvent) {
      this.if_exists(this.pressed, e.key.toUpperCase(), (index, value) =>
        this.pressed.splice(index, 1)
      );
    },
    if_exists(
      array: string[],
      value: string,
      action: (index: number, value: string) => any
    ) {
      const index = array.indexOf(value);
      if (index >= 0) action(index, value);
    },
    next() {
      this.typed = "";
      if (this.indexes.length <= 0) {
        this.indexes = Array.from(Array(this.words.length)).map((_, i) => i);
        for(let i = 0; i < this.words.length; i++) {
          const j = Math.floor(Math.random() * this.words.length);
          const n = this.indexes[j];
          this.indexes[j] = this.indexes[i];
          this.indexes[i] = n;
        }
      }
      this.text = this.words[this.indexes.shift()!];
    },
  },
});
</script>

<style lang="scss" scoped>
main {
  margin: 1em auto;
  display: table;
  .display {
    font-size: 5rem;
    padding: 2em 0;
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
    > :nth-child(4) {
      margin-left: 5em;
    }
    ul {
      display: flex;
      padding: 0;
      list-style-type: none;
      li {
        border: 1px solid #ddd;
        width: 4em;
        line-height: 4em;
        text-align: center;
        margin: 0.1rem;
        &.pressed {
          background-color: #faa;
          transform: translateY(0.1rem);
        }
      }
    }
  }
}
</style>