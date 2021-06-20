export class Key {
    constructor(
      public label: string,
      public code: number,
      public clazz?: string
    ) {}
    toJSON() {
      return { label: this.label, code: this.code, clazz: this.clazz };
    }
  }
  
  export type Handler = (code: number, key: string) => void;
  export class Keyboard {
    handler?: Handler;
    keymaps: Key[][] = [];
    pressed: number[] = [];
    translators: { to: string; froms: string[] }[] = [];
    attach(target: Element | Document) {
      target.addEventListener("keydown", this.keydown);
      target.addEventListener("keyup", this.keyup);
    }
    detach(target: Element | Document) {
      target.removeEventListener("keydown", this.keydown);
      target.removeEventListener("keyup", this.keyup);
    }
    keydown = ((e: KeyboardEvent) => {
      e.preventDefault();
      if (!this.pressed.includes(e.keyCode)) {
        this.pressed.push(e.keyCode);
      }
      if (this.handler) {
        this.handler(e.keyCode, e.key);
      }
    }) as (e: Event) => void;
    keyup = ((e: KeyboardEvent) => {
      e.preventDefault();
      const index = this.pressed.indexOf(e.keyCode);
      if (index >= 0) {
        this.pressed.splice(index, 1);
      }
    }) as (e: Event) => void;
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
      const inner = (a: (i: string) => string, b: (i: string) => string) => {
        const candidates = this.translators.filter((i) =>
          expected.startsWith(a(i.to))
        );
        let result = { from: "", to: "" };
        candidates.forEach((i) => {
          const froms = i.froms.filter((j) => input.endsWith(b(j)));
          if (froms.length > 0) {
            const from = froms.reduce((a, b) => (a.length > b.length ? a : b));
            if (from != null && i.to.length > result.to.length) {
              result.from = b(from);
              result.to = a(i.to);
            }
          }
        });
        return result.from.length ? result : null;
      };
      return (
        inner(
          (i) => "っ" + i,
          (i) => i.charAt(0) + i
        ) ||
        inner(
          (i) => i,
          (i) => i
        )
      );
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
        const inner = (a: (i: string) => string, b: (i: string) => string) => {
          const translator = this.translators
            .filter((i) => word.startsWith(a(i.to)))
            .sort((a, b) => b.to.length - a.to.length)[0];
          if (translator == null) return false;
          const letter = b(translator.froms[0]);
          result.push(letter);
          word = word.substr(a(translator.to).length);
          return true;
        };
        inner(
          (i) => "っ" + i,
          (i) => i.charAt(0) + i
        ) ||
          inner(
            (i) => i,
            (i) => i
          );
      }
      return result.join("");
    }
  }
  