import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface CMSBlock {
  id: string
  type: 'text' | 'tiptap' | 'image'
  label: string
  key: string
  value: any
}

export interface CMSPage {
  id: string
  title: string
  slug: string
  blocks: CMSBlock[]
  order: number
  createdAt: string
  updatedAt: string
}

export function useCMSPage(slug: MaybeRefOrGetter<string>) {
  const { data: page, error, status, refresh } = useFetch<CMSPage>(() => `/api/pages/${toValue(slug)}`)

  const fields = computed(() => {
    const map: Record<string, any> = {}
    if (page.value?.blocks) {
      for (const block of page.value.blocks) {
        if (block.key) {
          map[block.key] = block.value
        }
      }
    }
    return map
  })

  const getBlockValue = (key: string, defaultValue: any = '') => {
    return fields.value[key] ?? defaultValue
  }

  const getBlock = (key: string): CMSBlock | undefined => {
    return page.value?.blocks?.find(b => b.key === key)
  }

  return {
    page,
    fields,
    error,
    status,
    refresh,
    getBlockValue,
    getBlock
  }
}
