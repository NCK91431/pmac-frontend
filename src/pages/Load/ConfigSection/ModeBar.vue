<template>
  <div class="mode-bar">
    <div class="mode-bar-inner">
      <span class="mode-text">
        <i class="bi bi-info-circle"></i>
        <span v-if="mode === 'T'">
          您正在进行的是 <strong>总负荷预测</strong>
        </span>
        <span v-else> 您正在进行的是 <strong>分项负荷预测</strong> </span>
      </span>
      <span
        v-if="stage === 0 && !isContinue"
        class="btn-mode-switch"
        @click="$emit('switchMode')"
      >
        切换到
        <strong v-if="mode === 'T'">分项负荷预测</strong>
        <strong v-else>总负荷预测</strong>
        <i class="bi bi-arrow-left-right"></i>
      </span>
      <button
        v-if="stage === 2"
        class="btn-new-prediction"
        @click="$emit('newPrediction')"
      >
        新建预测<i class="bi bi-plus-circle"></i>
      </button>
    </div>
    <Instructions
      v-if="stage === 0 && mode === 'T'"
      @switchMode="$emit('switchMode')"
    />
  </div>
</template>

<script setup>
import Instructions from "./components/Instructions.vue";

defineProps({
  mode: { type: String, required: true },
  stage: { type: Number, required: true },
  isContinue: { type: Boolean, required: true },
});

defineEmits(["switchMode", "newPrediction"]);
</script>

<style lang="scss" scoped>
.mode-bar {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.5rem;
  background: #f0f7ff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #2c6fbb;

  .mode-bar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mode-text {
    color: #495057;
    font-size: 1.1rem;

    i {
      color: #2c6fbb;
      margin-right: 8px;
    }

    strong {
      color: #2c6fbb;
      font-weight: 600;
    }
  }

  .btn-mode-switch {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;

    strong {
      font-weight: 600;
      color: inherit;
      padding-right: 12px;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: left 0.5s ease;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      color: #fff;

      &::before {
        left: 100%;
      }

      i {
        transform: rotate(180deg);
      }
    }

    &:active {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    i {
      font-size: 1.1rem;
      transition: transform 0.4s ease;
      vertical-align: middle;
    }
  }

  .btn-new-prediction {
    background: linear-gradient(135deg, #2ecc71 0%, #1abc9c 100%);
    border: none;
    position: relative;
    overflow: hidden;
    padding: 10px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 5px 20px rgba(46, 204, 113, 0.6);
      transform: translateY(-4px);
    }

    &:active {
      transform: translateY(-1px);
      box-shadow: 0 2px 10px rgba(46, 204, 113, 0.4);
    }

    i {
      margin-left: 8px;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    &:hover i {
      transform: translateY(3px);
    }
  }
}
</style>
