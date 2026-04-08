<script setup>
import { ref, reactive, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '../stores/transaction'; // 경로에 맞게 수정하세요
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import AlertModal from '../components/AlertModal.vue';

const store = useTransactionStore();

// Store의 반응형 상태를 View에서 바로 사용하기 위해 추출
const { inandout, accounts, currentSort, displayTransactions } =
  storeToRefs(store);

// UI/로컬 상태 관리
const editMode = ref(false);
const editId = ref(null);

const isModalShow = ref(false);
const isAlertShow = ref(false);
const alertMsg = ref('');
const targetId = ref(null);

const form = reactive({
  date: new Date().toISOString().substr(0, 10),
  amount: '',
  category: '',
  inandout_id: 1,
  account_id: '',
  memo: '',
  user_id: '1',
  id: '',
});

// --- Actions ---

// 알림창 표시
const showAlert = (msg) => {
  alertMsg.value = msg;
  isAlertShow.value = true;
};

// 삭제 관련
const openDeleteModal = (id) => {
  targetId.value = id;
  isModalShow.value = true;
};

const confirmDelete = async () => {
  if (targetId.value) {
    await store.deleteTransaction(targetId.value);
  }
  isModalShow.value = false;
};

// 추가
const handleAddTransaction = async () => {
  if (!form.amount) return showAlert('금액을 입력해주세요.');
  if (!form.category) return showAlert('카테고리를 입력해주세요.');

  await store.addTransaction(form);
  resetForm();
};

// 수정 모드 진입
const selectTransaction = (tx) => {
  Object.assign(form, tx);
  editMode.value = true;
  editId.value = tx.id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 수정 완료
const handleUpdateTransaction = async () => {
  await store.updateTransaction(editId.value, form);
  resetForm();
};

// 폼 초기화
const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  editMode.value = false;
  editId.value = null;
  Object.assign(form, {
    date: new Date().toISOString().substr(0, 10),
    amount: '',
    category: '',
    inandout_id: '1',
    memo: '',
    user_id: '1',
    account_id: accounts.value.length > 0 ? accounts.value[0].id : '',
    id: '',
  });
};

// --- Lifecycle ---
onMounted(async () => {
  await store.fetchTransactions();
  await store.fetchInAndOut();
  await store.fetchAccounts();

  // 초기 등록 시 첫 번째 계좌가 자동으로 선택되도록 설정
  if (accounts.value.length > 0 && !form.account_id) {
    form.account_id = accounts.value[0].id;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <div>
          <p class="eyebrow">TRANSACTION</p>
          <h1>{{ editMode ? '내역 수정' : '내역 추가' }}</h1>
        </div>
      </header>

      <section class="panel">
        <div class="mission-list">
          <div class="status-item">
            <div class="status-label-row"><span>날짜</span></div>
            <input type="date" v-model="form.date" class="custom-input" />
          </div>

          <div class="status-item">
            <div class="status-label-row"><span>금액</span></div>
            <input
              type="number"
              v-model="form.amount"
              placeholder="0"
              class="custom-input amount-input"
            />
          </div>

          <div class="asset-grid" style="margin-top: 0">
            <div class="status-item">
              <div class="status-label-row"><span>카테고리</span></div>
              <input
                v-model="form.category"
                placeholder="식비, 교통 등"
                class="custom-input"
              />
            </div>
            <div class="status-item">
              <div class="status-label-row"><span>수입/지출</span></div>
              <select v-model="form.inandout_id" class="custom-input">
                <option
                  v-for="item in inandout"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="status-item">
            <div class="status-label-row"><span>계좌</span></div>
            <select v-model="form.account_id" class="custom-input">
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.bank }} - {{ acc.acc_num.slice(-4) }}
              </option>
            </select>
          </div>

          <div class="status-item">
            <div class="status-label-row"><span>메모</span></div>
            <input
              v-model="form.memo"
              placeholder="상세 내용 입력"
              class="custom-input"
            />
          </div>
        </div>

        <div style="margin-top: 20px">
          <button
            v-if="!editMode"
            @click="handleAddTransaction"
            class="quick-btn"
            style="width: 100%"
          >
            내역 저장하기
          </button>
          <div v-else style="display: flex; gap: 8px">
            <button
              @click="handleUpdateTransaction"
              class="quick-btn"
              style="width: 70%"
            >
              수정 완료
            </button>
            <button
              @click="cancelEdit"
              class="quick-btn"
              style="width: 30%; background: #e2e8f0; color: #475569"
            >
              취소
            </button>
          </div>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h3>거래 내역</h3>
          <div class="sort-controls">
            <button
              :class="['sort-btn', { active: currentSort === 'date' }]"
              @click="store.setSort('date')"
            >
              최신순
            </button>
            <button
              :class="['sort-btn', { active: currentSort === 'amount' }]"
              @click="store.setSort('amount')"
            >
              금액순
            </button>
          </div>
        </div>

        <div class="transaction-list">
          <div
            v-for="tx in displayTransactions"
            :key="tx.id"
            class="transaction-item"
          >
            <div class="tx-left">
              <div
                :class="[
                  'tx-icon',
                  tx.inandout_id === '1' ? 'income' : 'expense',
                ]"
              >
                {{ tx.category?.charAt(0) || 'Etc' }}
              </div>
              <div>
                <p class="tx-title">{{ tx.category }}</p>
                <p class="tx-meta">
                  {{ tx.date }} | {{ store.getAccountName(tx.account_id) }} |
                  {{ tx.memo }}
                </p>
              </div>
            </div>

            <div style="text-align: right">
              <p
                :class="[
                  'tx-amount',
                  tx.inandout_id === '1' ? 'income' : 'expense',
                ]"
              >
                {{ tx.inandout_id === '1' ? '+' : '-'
                }}{{ Number(tx.amount).toLocaleString() }}원
              </p>
              <div
                style="
                  margin-top: 4px;
                  display: flex;
                  gap: 4px;
                  justify-content: flex-end;
                "
              >
                <button
                  @click="selectTransaction(tx)"
                  class="badge"
                  style="border: none; cursor: pointer"
                >
                  수정
                </button>
                <button
                  @click="openDeleteModal(tx.id)"
                  class="badge"
                  style="
                    border: none;
                    cursor: pointer;
                    background: #ffe4e6;
                    color: #e11d48;
                  "
                >
                  삭제
                </button>
                <DeleteConfirmModal
                  :show="isModalShow"
                  @confirm="confirmDelete"
                  @cancel="isModalShow = false"
                />
                <AlertModal
                  :show="isAlertShow"
                  :message="alertMsg"
                  @close="isAlertShow = false"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

/* 이전과 동일한 스타일 코드 */
.custom-input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.custom-input:focus {
  border-color: #0f172a;
}

.page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  color: #0f172a;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.container {
  max-width: 430px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header,
.asset-top,
.transaction-item,
.tx-left,
.meta-row,
.status-label-row,
.mission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.top-align {
  align-items: flex-start;
}

.eyebrow,
.character-eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.eyebrow {
  color: #64748b;
}

.character-eyebrow {
  color: #b45309;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 30px;
  line-height: 1.2;
}

h2 {
  margin-top: 8px;
  font-size: 32px;
  line-height: 1.2;
}

h3 {
  font-size: 20px;
  line-height: 1.3;
}

.quick-btn {
  border: none;
  background: #0f172a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.16);
}

.panel,
.asset-panel,
.character-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.panel,
.character-panel {
  padding: 20px;
}

.asset-panel {
  padding: 22px;
}

.label,
.section-head p,
.character-desc,
.mission-reward,
.tx-meta,
.meta-row span {
  color: #64748b;
}

.label {
  font-size: 14px;
}

.icon-box {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #334155;
}

.asset-grid,
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.mini-card,
.category-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 16px;
}

.mini-card p,
.category-name,
.reward-title,
.tx-meta,
.mission-reward,
.section-head p,
.character-desc {
  font-size: 13px;
}

.mini-card strong,
.category-amount {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  font-weight: 800;
}

.badge,
.mood-badge,
.mission-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.badge {
  background: #f1f5f9;
  color: #334155;
}

.progress-track,
.status-track {
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
}

.progress-track {
  height: 12px;
  background: #e2e8f0;
  margin-top: 14px;
}

.progress-bar {
  height: 100%;
  background: #0f172a;
  border-radius: 999px;
}

.meta-row {
  margin-top: 12px;
  font-size: 14px;
}

.meta-row strong {
  font-size: 14px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 12px;
}

.character-panel {
  background: linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%);
  border-color: #fde68a;
}

.character-card {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 26px;
  padding: 16px;
}

.avatar-wrap {
  border-radius: 24px;
  background: linear-gradient(180deg, #fde68a 0%, #fed7aa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.avatar {
  font-size: 52px;
  line-height: 1;
}

.avatar-text {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.sort-controls {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.sort-btn {
  border: none;
  background: transparent;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.sort-btn.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

/* 기존 section-head 수정 (버튼이 옆으로 가도록) */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.status-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 25px;
  width: 100%;
  gap: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-label-row span,
.status-label-row strong {
  font-size: 12px;
}

.status-label-row span {
  color: #475569;
}

.status-track {
  height: 10px;
  background: #e2e8f0;
}

.status-track.exp {
  background: #ffedd5;
}

.status-bar {
  height: 100%;
  background: #334155;
  border-radius: 999px;
}

.status-bar.exp {
  background: #f59e0b;
}

.reward-box {
  margin-top: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 16px;
}

.reward-title {
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
}

.mission-list,
.transaction-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mission-item,
.transaction-item {
  background: #f8fafc;
  border-radius: 18px;
  padding: 14px 16px;
}

.mission-title,
.tx-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.mission-badge.done {
  background: #dcfce7;
  color: #166534;
}

.mission-badge.doing {
  background: #e2e8f0;
  color: #475569;
}

.tx-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.tx-icon.income {
  background: #dbeafe;
  color: #1d4ed8;
}

.tx-icon.expense {
  background: #ffe4e6;
  color: #e11d48;
}

.tx-amount {
  font-size: 14px;
  font-weight: 800;
}

.tx-amount.income {
  color: #1d4ed8;
}

.tx-amount.expense {
  color: #e11d48;
}

@media (max-width: 420px) {
  .page {
    padding: 14px;
  }

  .container {
    gap: 14px;
  }

  h1 {
    font-size: 26px;
  }

  h2 {
    font-size: 28px;
  }

  .character-card {
    grid-template-columns: 1fr;
  }

  .asset-grid,
  .category-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Chrome, Safari, Edge, Opera에서 증감 버튼 제거 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox에서 증감 버튼 제거 */
input[type='number'] {
  -moz-appearance: textfield;
}

/* 추가 팁: 금액 입력창은 우측 정렬이 가독성이 좋을 수 있습니다 (선택사항) */
.amount-input {
  text-align: right;
  font-weight: 600;
  color: #0f172a;
}
</style>
