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
* 促音対応
* 効果音Safari対応
* ミスするまでヒント非表示
* 漢字表示対応
* 撥音補助線
## todo
* 別スペル入力対応
* Backspace調整
* 基礎スキップ
* 毎日ルーチン
--><template>
  <main v-if="course">
    <div class="info">
      <h1 class="course">
        Step {{ courses.indexOf(course) + 1 }} {{ course.subject }}({{
          course.length
        }})
      </h1>
      <div class="progress" v-if="doing">あと {{ indexes.length + 1 }}</div>
    </div>
    <template v-if="keyboard.keymaps.length > 0">
      <div :class="{ display: true, doing }">
        <div :class="{ kana: true, hidden: word == text }">
          <template v-if="doing">
            <span class="typed">{{ typed }}</span
            ><span class="will_typing">{{ will_typing }}</span> </template
          >&nbsp;
        </div>
        <template v-if="doing">
          <div class="line" v-if="word == text">
            <span class="typed">{{ typed }}</span
            ><span class="will_typing">{{ will_typing }}</span>
          </div>
          <div class="line" v-else>{{ word }}</div>
        </template>
        <div class="prompt" v-else>スペースキーで開始します</div>
        <div
          :class="{
            hint: true,
            hidden: !record || hint.startsWith(record.raw_typed),
          }"
        >
          <span class="raw_typed">{{ raw_typed }}</span
          ><span>{{ hint.substr(raw_typed.length) }}&nbsp;</span>
        </div>
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
                v-for="(miss_word, j) in history.miss_words"
                :key="j"
                class="miss_word"
              >
                {{ miss_word }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </template>
    <dl class="debug" v-if="$is_dev">
      <dt>text</dt>
      <dd>{{ text }}</dd>
      <dt>typed</dt>
      <dd>{{ typed }}</dd>
      <dt>raw_typed</dt>
      <dd>{{ raw_typed }}</dd>
      <dt>record.typed</dt>
      <dd>{{ record && record.typed }}</dd>
      <dt>hint</dt>
      <dd>{{ hint }}</dd>
      <dt>record.raw_typed</dt>
      <dd>{{ record && record.raw_typed }}</dd>
    </dl>
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
import { SE } from "~/logic/se";
import { Key, Keyboard } from "~/logic/keyboard";
import { Record, History } from "~/logic/history";
import { Course } from "~/logic/course";

export default Vue.extend({
  data(): {
    keyboard: Keyboard;
    typed: string;
    raw_typed: string;
    word: string;
    text: string;
    hint: string;
    indexes: number[];
    records: Record[];
    doing: boolean;
    histories: History[];
    courses: Course[];
    course_index: number;
    alert: string;
    se: SE | null;
    review_course: Course | null;
  } {
    return {
      keyboard: new Keyboard(),
      typed: "",
      raw_typed: "",
      word: "",
      text: "",
      hint: "",
      indexes: [],
      records: [],
      doing: false,
      histories: [],
      courses: [],
      course_index: 0,
      alert: "",
      se: null,
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
    const [keymaps, romaji, course_index] = await Promise.all([
      this.$axios.$get("/api/typing/keymaps", options),
      this.$axios.$get("/api/typing/romaji", options),
      this.$axios.$get("/api/typing/index", options),
    ]);
    this.keyboard.load(keymaps, romaji);
    this.courses = await Course.load(
      course_index,
      this.keyboard.keymaps.flat(),
      (url) => this.$axios.$get(url, options)
    );
  },
  fetchOnServer: false,
  created() {
    this.$nuxt.$emit("sidebar_disabled", true);
  },
  mounted() {
    this.se = new SE("/type.mp3");
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
  },
  watch: {
    histories(value: History[]) {
      localStorage && (localStorage.typing__histories = JSON.stringify(value));
    },
  },
  methods: {
    next() {
      this.typed = "";
      this.raw_typed = "";
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
        this.word = "";
        this.text = "";
        this.hint = "";
      } else {
        const index = this.indexes.shift()!;
        this.word = this.course.words[index];
        this.text = this.course.kanas[index];
        this.hint = this.keyboard.hint(this.text);
        this.records.push(new Record(this.text));
      }
    },
    setup(shuffle: boolean) {
      this.indexes = Array.from(Array(this.course.length)).map((_, i) => i);
      if (!shuffle) return;
      for (let i of this.indexes) {
        const j = Math.floor(Math.random() * this.course.length);
        [this.indexes[j], this.indexes[i]] = [this.indexes[i], this.indexes[j]];
      }
    },
    onpress(code: number, key: string) {
      if (this.alert.length > 0) {
        this.alert = "";
        return;
      }
      this.se?.play();
      if (!this.doing && code == 32) {
        this.setup(true);
        this.next();
        this.doing = true;
        return;
      }
      if (this.keyboard.is_valid(code)) {
        if (code == 8) {
          if (this.typed.length > 0) {
            const letter = this.typed.slice(-1)[0];
            this.typed = this.typed.slice(0, -1);
            this.raw_typed = this.raw_typed.slice(
              0,
              -this.keyboard.match(letter, this.raw_typed)!.from.length
            );
          }
          return;
        }
        if (!this.doing) return;
        this.record.typed += key;
        this.record.raw_typed += key;
        if (this.will_typing.charAt(0) == key) {
          this.typed += key;
          this.raw_typed += key;
        } else {
          const matched = this.keyboard.match(
            this.will_typing,
            this.record.typed
          );
          if (matched) {
            this.typed += matched.to;
            this.record.typed =
              this.record.typed.slice(0, -matched.from.length) + matched.to;
            this.raw_typed += matched.from;
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
  .kana {
    font-size: 3rem;
  }
  .line {
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    position: relative;
    &:after {
      position: absolute;
      top: 30%;
      width: 100%;
      left: 0;
      border-top: 1px solid rgba(200, 200, 200, 0.5);
      content: "";
    }
  }
  .prompt {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  .display {
    font-size: 5rem;
    padding: 2em 0 1em 0;
    text-align: center;
    .typed {
      color: #aaa;
      padding: 0 0 0 1em;
    }
    .raw_typed {
      color: #aaa;
    }
    .will_typing {
      padding: 0 1em 0 0;
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
      margin-top: -20rem;
      min-width: 30em;
      min-height: 10em;
      text-align: center;
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
  .debug {
    position: fixed;
    right: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.3);
    > dd::before {
      content: "[";
    }
    > dd::after {
      content: "]";
    }
  }
  .hidden {
    visibility: hidden;
  }
}
</style>