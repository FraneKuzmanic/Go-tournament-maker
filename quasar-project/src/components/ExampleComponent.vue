<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  toRef,
  Ref,
} from 'vue';
import { Todo, Meta } from './models';
import {firebaseConfig} from '../firebase/init';
import { onMounted } from 'vue'; // Import onMounted from Vue 3
import { doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


function useClickCount() {
  const clickCount = ref(0);
  function increment() {
    clickCount.value += 1
    return clickCount.value;
  }

  return { clickCount, increment };
}

function useDisplayTodo(todos: Ref<Todo[]>) {
  const todoCount = computed(() => todos.value.length);
  return { todoCount };
}

export default defineComponent({
  name: 'ExampleComponent',
  props: {
    title: {
      type: String,
      required: true
    },
    todos: {
      type: Array as PropType<Todo[]>,
      default: () => []
    },
    meta: {
      type: Object as PropType<Meta>,
      required: true
    },
    active: {
      type: Boolean
    }
  },
  setup (props) {

    //dohvaćanje korisnika iz firestore-a, provjera rada
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    onMounted(async () => {
      try {
        const usersCollection = doc(db, 'users', 'urekkLRIn5YTqhYMezPx'); // Replace 'users' with your actual collection name
        const usersSnapshot = await getDoc(usersCollection);

        console.log('Document data:', usersSnapshot.data());
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    });
    
    
    return { ...useClickCount(), ...useDisplayTodo(toRef(props, 'todos')) };
  },
});
</script>
