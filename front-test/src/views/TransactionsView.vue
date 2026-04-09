<script setup>
import { ref, reactive, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '../stores/TransactionStore'; // 경로에 맞게 수정하세요
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import AlertModal from '../components/AlertModal.vue';

const store = useTransactionStore();

// Store의 반응형 상태를 View에서 바로 사용하기 위해 추출
const { inandout, accounts, currentSort, displayTransactions } =
  storeToRefs(store);

// UI/로컬 상태 관리
const editMode = ref(false);
const editId = ref(null);

const isDeleteModalShow = ref(false);
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
  isDeleteModalShow.value = true;
};

const confirmDelete = async () => {
  if (targetId.value) {
    await store.deleteTransaction(targetId.value);
  }
  isDeleteModalShow.value = false;
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
                  :show="isDeleteModalShow"
                  @confirm="confirmDelete"
                  @cancel="isDeleteModalShow = false"
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

<style scoped src="../assets/transaction.css"></style>
