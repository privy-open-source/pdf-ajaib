<script lang="ts">
import type { PropType } from 'vue-demi';
import { computed, defineComponent } from 'vue-demi'
import type { AddonPositionVariant } from './main'

export default defineComponent({
  props: {
    position: {
      type: String as PropType<AddonPositionVariant>,
      default: 'right'
    }
  },
  setup(props) {
    const classNames = computed(() => {
      const result: string[] = []

      if (props.position) result.push(`pdf-object__addon--${props.position}`)

      return result
    })

    return { classNames }
  }
})
</script>

<template>
  <div data-testid="pdf-object-addon" class="pdf-object__addon" :class="classNames">
    <slot />
  </div>
</template>

<style lang="scss">
.pdf-object {
  &__addon {
    position: absolute;

    &--right {
      top: 0;
      left: 100%;
      padding-left: 0.5rem;
    }

    &--left {
      top: 0;
      right: 100%;
      padding-right: 0.5rem;
    }

    &--top {
      left: 0;
      bottom: 100%;
      padding-bottom: 0.5rem;
    }

    &--bottom {
      left: 0;
      top: 100%;
      padding-top: 0.5rem;
    }
  }
}
</style>
