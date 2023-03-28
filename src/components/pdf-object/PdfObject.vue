<script lang="ts">
import { autoUpdate } from '@floating-ui/dom'
import { syncRef, templateRef, until, useVModel } from '@vueuse/core'
import { defineComponent, inject, onMounted, provide, ref, toRef, watchEffect } from 'vue-demi'
import useDrag from './utils/use-drag'
import useResize from './utils/use-resize'
import { PDF_OBJECTS_CONTEXT, PDF_OBJECT_CONTEXT, useObjectModel, usePage, focus } from './main'
import { computePosition, getPosition } from './utils/position'
import type { ObjectPosition } from './utils/overlap';
import { getEmptyPosition } from './utils/overlap'
import PdfObjectDebugger from './PdfObjectDebugger.vue'

export default defineComponent({
  components: { PdfObjectDebugger },
  props: {
    x: {
      type: Number,
      default: undefined
    },
    y: {
      type: Number,
      default: undefined
    },
    page: {
      type: Number,
      default: undefined
    },
    width: {
      type: Number,
      default: 198
    },
    height: {
      type: Number,
      default: 106
    },
    minWidth: {
      type: Number,
      default: undefined
    },
    minHeight: {
      type: Number,
      default: undefined
    },
    maxWidth: {
      type: Number,
      default: undefined
    },
    maxHeight: {
      type: Number,
      default: undefined
    },
    moveable: {
      type: Boolean,
      default: true
    },
    resizable: {
      type: Boolean,
      default: true
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:x', 'update:y', 'update:page', 'update:width', 'update:height'],
  setup(props) {
    const object = templateRef<HTMLDivElement>('object')
    const { root, scale, objects } = inject(PDF_OBJECTS_CONTEXT) || {}

    const vX = useVModel(props, 'x')
    const vY = useVModel(props, 'y')
    const vPage = useVModel(props, 'page')
    const vWidth = useVModel(props, 'width')
    const vHeight = useVModel(props, 'height')

    const { id, x, y, page, width, height, minHeight, minWidth, maxHeight, maxWidth, ratio } =
      useObjectModel(props)

    const isDragged = ref(false)
    const lastX = ref()
    const lastY = ref()
    const lastPage = ref()
    const pageEl = usePage(page)

    const moveable = useDrag(object, {
      onstart() {
        const { left, top } = object.value.getBoundingClientRect()

        isDragged.value = true
        lastX.value = x.value
        lastY.value = y.value
        lastPage.value = page.value

        x.value = left
        y.value = top
      },
      onmove(event) {
        move(event.dx, event.dy)
      },
      onend(event) {
        if (event.relatedTarget) {
          const result = getPosition({
            reference: event.relatedTarget as HTMLElement,
            container: root!.value,
            object: object.value,
            scale: scale!.value
          })

          x.value = result.x
          y.value = result.y
          page.value = result.page
        } else {
          // Back to last valid coordinate
          x.value = lastX.value
          y.value = lastY.value
          page.value = lastPage.value
        }

        isDragged.value = false
      }
    })

    const resizable = useResize(object, {
      minHeight: minHeight,
      minWidth: minWidth,
      maxHeight: maxHeight,
      maxWidth: maxWidth,
      scale: scale,
      ratio: ratio,
      reference: pageEl,
      onmove(event) {
        if (event.rect && scale!.value) {
          width.value = event.rect.width / scale!.value
          height.value = event.rect.height / scale!.value
        }
      }
    })

    watchEffect((onCleanup) => {
      if (object.value) {
        if (pageEl.value && root!.value) {
          object.value.style.display = 'block'
          object.value.style.width = `${width.value}px`
          object.value.style.height = `${height.value}px`

          if (isDragged.value) {
            object.value.style.position = 'fixed'
            object.value.style.transform = `translate(${x.value}px, ${y.value}px) scale(${scale!.value})`
            object.value.style.zIndex = '50'
          } else {
            const cleanup = autoUpdate(
              pageEl.value,
              object.value,
              () => {
                const { left, top } = computePosition({
                  reference: pageEl.value,
                  container: root!.value,
                  x: x.value || 0,
                  y: y.value || 0,
                  scale: scale!.value
                })

                object.value.style.position = 'absolute'
                object.value.style.transform = `translate(${left}px, ${top}px) scale(${scale!.value})`
                object.value.style.zIndex = '10'
              },
              { ancestorScroll: false }
            )

            onCleanup(cleanup)
          }
        } else object.value.style.display = 'none'
      }
    })

    function move(dx: number, dy: number) {
      if (props.moveable) {
        if (x.value)
          x.value += dx

        if (y.value)
          y.value += dy
      }
    }

    function autoPosition() {
      const otherObjects = [...objects!.values()].filter((obj) => {
        return (
          obj.id !== id &&
          Number.isFinite(obj.x) &&
          Number.isFinite(obj.y) &&
          obj.page === page.value
        )
      })

      const size = {
        width: width.value,
        height: height.value
      }

      const offside = {
        width: pageEl.value.clientWidth / scale!.value,
        height: pageEl.value.clientHeight / scale!.value
      }

      const center = getEmptyPosition({
        size: size,
        offside: offside,
        objects: otherObjects as ObjectPosition[]
      })

      x.value = center.x
      y.value = center.y
    }

    syncRef(x, vX)
    syncRef(y, vY)
    syncRef(page, vPage)
    syncRef(width, vWidth)
    syncRef(height, vHeight)

    syncRef(moveable, toRef(props, 'moveable'), {
      direction: 'rtl',
      immediate: true
    })
    syncRef(resizable, toRef(props, 'resizable'), {
      direction: 'rtl',
      immediate: true
    })

    onMounted(async () => {
      await until(pageEl).toBeTruthy()

      if (!Number.isFinite(x.value) || !Number.isFinite(y.value)) autoPosition()

      if (props.autofocus) focus(object.value)
    })

    // Provide some data for debug
    provide(PDF_OBJECT_CONTEXT, {
      id,
      x,
      y,
      page,
      width,
      height,
      minHeight,
      minWidth,
      maxHeight,
      maxWidth,
      ratio
    })

    return {
      move,
      focus
    }
  }
})
</script>

<template>
  <div
    ref="object"
    data-testid="pdf-object"
    class="pdf-object"
    tabindex="0"
    :data-x="x"
    :data-y="y"
    :data-page="page"
    :data-width="width"
    :data-height="height"
    @keydown.up.stop.prevent="move(0, -1)"
    @keydown.down.stop.prevent="move(0, 1)"
    @keydown.left.stop.prevent="move(-1, 0)"
    @keydown.right.stop.prevent="move(1, 0)"
  >
    <div class="pdf-object__container">
      <slot />
      <pdf-object-debugger v-if="debug" />
    </div>
    <div v-show="resizable" class="pdf-object__resize resize-handle" />
  </div>
</template>

<style lang="scss">
.pdf-object {
  left: 0px;
  top: 0px;
  transform-origin: top left;
  touch-action: none;
  user-select: none;
  outline: 2px solid transparent;
  outline-offset: 2px;

  &__container {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: visible;
    border-radius: 8px;
    border-width: 2px;
    border-style: dashed;
    border-color: rgb(207, 207, 209);
    pointer-events: none;
    touch-action: none;

    button,
    input,
    textarea,
    a {
      pointer-events: none;
    }

    * {
      max-width: 100%;
    }
  }

  &__resize {
    position: absolute;
    bottom: 0px;
    right: 0px;
    height: 0.75rem;
    width: 0.75rem;
    transform: translate(50%, 50%) rotate(0) skew(0) skewY(0) scaleX(1) scaleY(1);
    border-radius: 999999px;
    background-color: rgb(207, 207, 209);
  }
}
</style>
