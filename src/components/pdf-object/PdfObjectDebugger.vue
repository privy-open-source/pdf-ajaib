<script lang="ts">
import { autoPlacement, autoUpdate, computePosition, offset } from '@floating-ui/dom'
import { templateRef } from '@vueuse/core'
import { defineComponent, inject, watchEffect } from 'vue-demi'
import { PDF_OBJECT_CONTEXT } from './main'

export default defineComponent({
  setup() {
    const { x, y, page, width, height } = inject(PDF_OBJECT_CONTEXT) || {}

    const target = templateRef<HTMLDivElement>('target')

    watchEffect(
      (onCleanup) => {
        if (target.value) {
          const cleanup = autoUpdate(target.value.parentElement as HTMLElement, target.value, () => {
            computePosition(target.value.parentElement as HTMLElement, target.value, {
              strategy: 'absolute',
              middleware: [autoPlacement(), offset(12)]
            }).then(({ x, y }) => {
              if (target.value) {
                target.value.style.left = `${x || 0}px`
                target.value.style.top = `${y || 0}px`
              }
            })
          })

          onCleanup(cleanup)
        }
      },
      { flush: 'post' }
    )

    return {
      x,
      y,
      page,
      width,
      height
    }
  }
})
</script>

<template>
  <div ref="target" data-testid="pdf-debugger" class="pdf-object__debugger">
    <pre data-testid="debug-x">x: {{ x }}</pre>
    <pre data-testid="debug-y">y: {{ y }}</pre>
    <pre data-testid="debug-page">page: {{ page }}</pre>
    <pre data-testid="debug-width">width: {{ width }}</pre>
    <pre data-testid="debug-height">height: {{ height }}</pre>
  </div>
</template>

<style lang="scss">
.pdf-object {
  &__debugger {
    position: absolute;
    display: grid;
    width: 198px;
    border-radius: 8px;
    padding: 1rem;
    background-color: rgb(13, 17, 23);
    color: rgb(255, 255, 255);
    grid-template-columns: repeat(1, minmax(0, 1fr));

    > pre {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
