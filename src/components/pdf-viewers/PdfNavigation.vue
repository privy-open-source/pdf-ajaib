<script lang="ts">
import { computed, defineComponent } from 'vue-demi'
import { usePdfContext } from './main'
import IconZoomIn from '~icons/carbon/zoom-in/16'
import IconZoomOut from '~icons/carbon/zoom-out/16'
import IconPrev from '~icons/carbon/chevron-up/16'
import IconNext from '~icons/carbon/chevron-down/16'

export default defineComponent({
  components: {
    IconZoomIn,
    IconZoomOut,
    IconPrev,
    IconNext
  },
  setup() {
    const { page, scale, totalPage } = usePdfContext()

    const pages = computed<any[]>(() => {
      return Array.from({ length: totalPage.value }).map((_, i) => {
        return {
          text: `${i + 1}`,
          value: i + 1
        }
      })
    })

    function zoomIn() {
      scale.value = Math.round(scale.value / 0.1) * 0.1 + 0.1
    }

    function zoomOut() {
      scale.value = Math.round(scale.value / 0.1) * 0.1 - 0.1
    }

    function next() {
      page.value++
    }

    function prev() {
      page.value--
    }

    return {
      page,
      pages,
      scale,
      totalPage,
      zoomIn,
      zoomOut,
      next,
      prev
    }
  }
})
</script>

<template>
  <div data-testid="pdf-navigation" class="pdf__navigation">
    <div class="pdf__navigation-container">
      <button class="pdf-zoom-out" @click="zoomOut">
        <icon-zoom-out class="icon" />
      </button>
      <span class="pdf__navigation-scale"> {{ (scale * 100).toFixed(0) }}% </span>
      <button class="pdf-zoom-in" @click="zoomIn">
        <icon-zoom-in />
      </button>
      <div class="divider" />
      <div class="custom-select">
        <select v-model="page">
          <option v-for="item in pages" :key="item" :value="item.value">
            {{ item.value }}
          </option>
        </select>
      </div>
      <span data-testid="pdf-total" class="pdf__navigation-scale"> of {{ totalPage }} </span>
      <button class="pdf-prev" @click="prev">
        <icon-prev />
      </button>
      <button class="pdf-next" @click="next">
        <icon-next />
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.pdf {
  &__navigation {
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 2.5rem;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    width: 20rem;

    &-container {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding: 0.6rem;
      background-color: rgb(86, 88, 93);
      color: rgb(182, 184, 185);
      align-items: center;
      justify-content: center;

      button {
        background-color: transparent;
        border-style: none;
        color: rgb(182, 184, 185);
        cursor: pointer;
      }

      .pdf-prev {
        margin-left: 5px;
      }
      .pdf-next {
        margin-left: 10px;
      }

      .custom-select {
        border-radius: 8px;
        overflow: hidden;

        select {
          color: rgb(182, 184, 185);
          border-color: rgb(86 88 93);
          background-color: rgb(25 29 35);
          width: 45px;
          height: 30px;
          padding: 0 0.5em;
          text-align: center;
          appearance: none;
          outline: 0;
          border: 0;
        }
      }

      .divider {
        display: inline;
        width: 1px;
        border: 0.5px inset;
        margin-left: 13px;
        margin-right: 12px;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        z-index: 1;
        align-items: center;
        border-color: rgb(207, 207, 209);
      }
    }

    &-scale {
      margin: 0 10px;
    }
  }
}
</style>
