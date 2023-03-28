<script lang="ts">
import { templateRef } from '@vueuse/core'
import { defineComponent, provide, toRef } from 'vue-demi'
import { PDF_OBJECTS_CONTEXT } from './main'
import { usePdfContext } from '../pdf-viewers/main'
import useDrop from './utils/use-drop'

export default defineComponent({
  props: {
    dropTarget: {
      type: String,
      default: '.pdfViewer > .page'
    }
  },
  setup(props) {
    const objects = new Map()
    const root = templateRef<HTMLDivElement>('root')
    const pdfContext = usePdfContext()
    const dropTarget = toRef(props, 'dropTarget')

    provide(PDF_OBJECTS_CONTEXT, {
      ...pdfContext,
      objects,
      root
    })

    useDrop(root, dropTarget)

    return {}
  }
})
</script>

<template>
  <div ref="root" data-testid="pdf-objects">
    <slot />
  </div>
</template>
