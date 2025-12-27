import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Todo,
  addTodo,
  deleteTodo,
  getTodos,
  initDB,
  updateTodo,
} from "../services/todoService";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [screen, setScreen] = useState(Dimensions.get("window"));

  const isMobile = screen.width < 600;

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) =>
      setScreen(window)
    );
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      await initDB();
      load();
    })();
  }, []);

  async function load() {
    setTodos(await getTodos());
  }

  async function submit() {
    if (!text.trim()) return;
    editingId
      ? await updateTodo(editingId, { text })
      : await addTodo(text);
    setText("");
    setEditingId(null);
    load();
  }

  async function toggle(item: Todo) {
    await updateTodo(item.id!, { done: item.done ? 0 : 1 });
    load();
  }

  async function remove(item: Todo) {
    await deleteTodo(item.id!);
    load();
  }

  function confirmDelete(item: Todo) {
    Platform.OS === "web"
      ? window.confirm("Hapus todo ini?") && remove(item)
      : Alert.alert("Hapus Todo", "Yakin ingin menghapus?", [
          { text: "Batal" },
          { text: "Hapus", style: "destructive", onPress: () => remove(item) },
        ]);
  }

  function renderItem({ item }: { item: Todo }) {
    return (
      <View
        style={[
          styles.card,
          item.done && styles.cardDone,
          isMobile && styles.cardMobile,
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => toggle(item)}
        >
          <Text style={styles.checkbox}>{item.done ? "✔️" : "⭕"}</Text>
          <Text
            style={[
              styles.todoText,
              item.done && styles.todoDone,
              isMobile && styles.todoTextMobile,
            ]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>

        <View style={[styles.actions, isMobile && styles.actionsMobile]}>
          <TouchableOpacity
            style={[styles.btn, styles.edit]}
            onPress={() => {
              setEditingId(item.id!);
              setText(item.text);
            }}
          >
            <Text style={styles.btnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.delete]}
            onPress={() => confirmDelete(item)}
          >
            <Text style={styles.btnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📝 Todo App</Text>
        <Text style={styles.subtitle}>Kelola tugas harianmu</Text>
      </View>

      {/* INPUT */}
      <View style={[styles.inputBox, isMobile && styles.inputBoxMobile]}>
        <TextInput
          placeholder="Tambah todo baru..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity
          style={[
            styles.addBtn,
            editingId && styles.saveBtn,
            isMobile && styles.addBtnMobile,
          ]}
          onPress={submit}
        >
          <Text style={styles.addText}>
            {editingId ? "💾 SIMPAN" : "➕ TAMBAH"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={todos}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Belum ada todo</Text>
          </View>
        }
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f4f8",
  },
  containerMobile: {
    padding: 12,
  },

  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    color: "#7f8c8d",
    marginTop: 4,
  },

  inputBox: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  inputBoxMobile: {
    flexDirection: "column",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  addBtnMobile: {
    paddingVertical: 14,
  },
  saveBtn: {
    backgroundColor: "#27ae60",
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardMobile: {
    padding: 12,
  },
  cardDone: {
    backgroundColor: "#ecf9f1",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    fontSize: 22,
    marginRight: 12,
  },
  todoText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  todoTextMobile: {
    fontSize: 14,
  },
  todoDone: {
    textDecorationLine: "line-through",
    color: "#95a5a6",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  actionsMobile: {
    gap: 8,
  },
  btn: {
    padding: 10,
    borderRadius: 10,
  },
  edit: {
    backgroundColor: "#3498db",
  },
  delete: {
    backgroundColor: "#e74c3c",
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    color: "#7f8c8d",
    marginTop: 8,
  },
});
