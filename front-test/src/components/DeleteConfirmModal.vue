<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: '정말 삭제하시겠습니까?' },
  description: { type: String, default: '삭제된 데이터는 복구할 수 없습니다.' },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-panel">
        <div class="modal-content">
          <div class="warning-icon">⚠️</div>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="emit('cancel')">취소</button>
          <button class="btn-delete" @click="emit('confirm')">삭제하기</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.modal-panel {
  background: #fff;
  width: 100%;
  max-width: 320px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content {
  padding: 32px 24px 20px;
  text-align: center;
}

.warning-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px;
  background: #f8fafc;
}

button {
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

button:active {
  transform: scale(0.96);
}

.btn-cancel {
  background: #fff;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-delete {
  background: #e11d48;
  color: #fff;
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
