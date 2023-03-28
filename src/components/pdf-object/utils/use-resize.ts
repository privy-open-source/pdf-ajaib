import type { Interactable, InteractEvent } from '@interactjs/types'
import type { MaybeRef } from '@vueuse/core'
import type { Ref} from 'vue-demi';
import { onScopeDispose, shallowRef, unref, watch } from 'vue-demi'

export interface ResizeOptions {
  onstart?: (event: InteractEvent) => void
  onmove?: (event: InteractEvent) => void
  onend?: (event: InteractEvent) => void

  handleSelector?: string
  reference?: MaybeRef<HTMLElement>
  minWidth?: MaybeRef<number>
  maxWidth?: MaybeRef<number>
  minHeight?: MaybeRef<number>
  maxHeight?: MaybeRef<number>
  scale?: MaybeRef<number>
  ratio?: MaybeRef<number>
}

export default function useResize(target: Ref<HTMLElement>, options: ResizeOptions = {}) {
  const enable = shallowRef(true)
  const instance = shallowRef<Interactable>()

  async function init() {
    destroy()

    if (target.value) {
      const { default: Interact } = await import('interactjs')

      // Interact.dynamicDrop(true)

      instance.value = Interact(target.value).resizable({
        enabled: enable.value,
        edges: {
          left: false,
          top: false,
          bottom: options.handleSelector ?? '.resize-handle',
          right: options.handleSelector ?? '.resize-handle'
        },
        onstart: options.onstart,
        onmove: options.onmove,
        onend: options.onend,
        modifiers: [
          Interact.modifiers.aspectRatio({
            ratio: unref(options.ratio) ?? 'preserve',
            modifiers: [
              Interact.modifiers.restrictSize({
                // @ts-ignore
                min: (_x, _y, element) => {
                  const scale = unref(options.scale) ?? 1

                  return {
                    ...element.rect,
                    width: unref(options.minWidth) || 1 * scale,
                    height: unref(options.minHeight) || 1 * scale
                  }
                },
                // @ts-ignore
                max: (_x, _y, element) => {
                  const scale = unref(options.scale) ?? 1

                  return {
                    ...element.rect,
                    width: unref(options.maxWidth) || 1 * scale,
                    height: unref(options.maxHeight) || 1 * scale
                  }
                }
              }),
              Interact.modifiers.restrictSize({
                // @ts-ignore
                max: (_x, _y, element) => {
                  const reference = unref(options.reference)

                  if (reference) {
                    const bounding = Interact.getElementRect(reference)

                    if (bounding) {
                      const width = bounding.right - (element.rect?.left || 0)
                      const height = bounding.bottom - (element.rect?.top || 0)

                      return {
                        ...bounding,
                        width,
                        height
                      }
                    }
                  }

                  return {
                    ...element.rect,
                    width: Number.POSITIVE_INFINITY,
                    height: Number.POSITIVE_INFINITY
                  }
                }
              })
            ]
          })
        ]
      })
    }
  }

  function destroy() {
    if (instance.value) instance.value.unset()
  }

  watch(target, async () => {
    await init()
  })

  watch(
    enable,
    (value) => {
      if (instance.value) instance.value.draggable(value)
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    destroy()
  })

  return enable
}
