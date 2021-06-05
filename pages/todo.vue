<!--
# todo
* 初期データ用意
* 初期データリスト表示
* 入力欄追加
* 新規登録処理追加
* 完了状態追加
* 完了切り替え追加
* 永続化
* 削除処理追加
* 操作履歴追加
* Undo処理追加
* 初期フォーカス設定
-->
<template>
  <main>
    <h1>Todo</h1>
    <form class="todos" @submit.prevent="add">
      <input
        ref="input"
        type="text"
        placeholder="やることを入力"
        v-model="new_todo"
      />
      <ol>
        <li
          v-for="(todo, i) in todos"
          :key="i"
          @click="toggle(todo)"
          :class="{ done: todo.done }"
        >
          {{ todo.subject }}
          <button type="button" @click.prevent.stop="remove(todo)">×</button>
        </li>
      </ol>
    </form>
    <aside class="histories">
      <h3>操作履歴</h3>
      <ul>
        <li v-for="(history, i) in histories" :key="i" @click="undo(i)">
          {{ history }}
          <button type="button" @click.prevent.stop="remove_commands(i)">
            ×
          </button>
        </li>
      </ul>
    </aside>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
class Todo {
  constructor(public subject: string, public done: boolean = false) {}
}
type CommandType = "add" | "remove" | "done" | "undone";
class Command {
  constructor(
    public type: CommandType,
    public subject: string,
    public timestamp = new Date()
      .toISOString()
      .substr(0, 16)
      .replace("T", " ")
      .replace(/-/g, "/")
  ) {}
  execute(todos: Todo[]) {
    switch (this.type) {
      case "add":
        todos.unshift(new Todo(this.subject));
        break;
      case "remove":
        todos.splice(
          todos.findIndex((i) => i.subject == this.subject),
          1
        );
        break;
      case "done":
        todos.find((i) => i.subject == this.subject)!.done = true;
        break;
      case "undone":
        todos.find((i) => i.subject == this.subject)!.done = false;
        break;
    }
  }
  to_history(): string {
    switch (this.type) {
      case "add":
        return `${this.timestamp} ${this.subject}を追加しました`;
      case "remove":
        return `${this.timestamp} ${this.subject}を削除しました`;
      case "done":
        return `${this.timestamp} ${this.subject}を完了にしました`;
      case "undone":
        return `${this.timestamp} ${this.subject}を未完了に戻しました`;
    }
  }
  reverse(): Command {
    switch (this.type) {
      case "add":
        return new Command("remove", this.subject);
      case "remove":
        return new Command("add", this.subject);
      case "done":
        return new Command("undone", this.subject);
      case "undone":
        return new Command("done", this.subject);
    }
  }
  static from(json: Object) {
    return Object.assign(new Command("add", ""), json);
  }
}
export type Data = {
  todos: Todo[];
  new_todo: string;
  commands: Command[];
};
export default Vue.extend({
  data(): Data {
    return {
      todos: [],
      new_todo: "",
      commands: [],
    };
  },
  mounted() {
    this.todos = (localStorage.todos && JSON.parse(localStorage.todos)) || [];
    this.commands =
      (localStorage.commands &&
        JSON.parse(localStorage.commands).map(Command.from)) ||
      [];
    if (this.$refs.input instanceof HTMLInputElement) this.$refs.input.focus();
  },
  computed: {
    histories(): string[] {
      return this.commands.map((i) => i.to_history());
    },
  },
  methods: {
    add() {
      if (
        this.new_todo.length > 0 &&
        !this.todos.some((i) => i.subject == this.new_todo)
      ) {
        this.save_command("add", this.new_todo).execute(this.todos);
        this.new_todo = "";
      }
    },
    toggle(todo: Todo) {
      todo.done = !todo.done;
      this.save_command(todo.done ? "done" : "undone", todo.subject).execute(
        this.todos
      );
    },
    remove(todo: Todo) {
      this.save_command("remove", todo.subject).execute(this.todos);
    },
    remove_commands(index: number) {
      this.commands.splice(index);
    },
    save_command(type: CommandType, subject: string): Command {
      const command = new Command(type, subject);
      this.commands.push(command);
      return command;
    },
    undo(index: number) {
      while (this.commands.length > index) {
        this.commands.pop()!.reverse().execute(this.todos);
      }
    },
  },
  watch: {
    todos: {
      handler: (value: Todo[]) =>
        localStorage && (localStorage.todos = JSON.stringify(value)),
      deep: true,
    },
    commands(value: Command[]) {
      localStorage && (localStorage.commands = JSON.stringify(value));
    },
  },
});
</script>

<style lang="scss" scoped>
.todos {
  input {
    font-size: 2rem;
  }
  li {
    cursor: pointer;
    font-size: 2rem;
    margin: 1rem;
    &.done {
      text-decoration: line-through;
      color: gray;
    }
  }
}
.histories {
  ul {
    display: flex;
    flex-direction: column-reverse;
    li {
      cursor: pointer;
    }
  }
}
</style>