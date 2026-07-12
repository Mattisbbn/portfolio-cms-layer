<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  const isSame = editor.value.getHTML() === value
  if (isSame) return
  editor.value.commands.setContent(value, false)
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <!-- Toolbar -->
    <div v-if="editor" class="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-2 flex gap-1 flex-wrap">
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        :class="{ 'bg-gray-200 dark:bg-gray-800': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        icon="i-heroicons-bold"
      />
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        :class="{ 'bg-gray-200 dark:bg-gray-800': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        icon="i-heroicons-italic"
      />
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        :class="{ 'bg-gray-200 dark:bg-gray-800': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </UButton>
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        :class="{ 'bg-gray-200 dark:bg-gray-800': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </UButton>
      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        :class="{ 'bg-gray-200 dark:bg-gray-800': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        icon="i-heroicons-list-bullet"
      />
    </div>
    <EditorContent :editor="editor" class="p-3 min-h-[150px] focus:outline-none tiptap-editor-content" />
  </div>
</template>

<style>
.tiptap-editor-content [contenteditable] {
  outline: none;
}
.tiptap-editor-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
.tiptap-editor-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}
.tiptap-editor-content h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.tiptap-editor-content h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
