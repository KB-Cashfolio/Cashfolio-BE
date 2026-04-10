<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '../stores/TransactionStore'; // 경로에 맞게 수정하세요
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import AlertModal from '../components/AlertModal.vue';

const store = useTransactionStore();

// Store의 반응형 상태를 View에서 바로 사용하기 위해 추출
const { inandout, accounts, categories, currentSort, displayTransactions } =
  storeToRefs(store);

// UI/로컬 상태 관리
const editMode = ref(false);
const editId = ref(null);

const isDeleteModalShow = ref(false);
const isAlertShow = ref(false);
const alertMsg = ref('');
const targetId = ref(null);

const selectedType = ref('1');

const form = reactive({
  id: '',
  user_id: '1',
  account_id: '',
  category_id: '',
  date: new Date().toISOString().substr(0, 10),
  amount: '',
  memo: '',
});

// 선택된 수입/지출(type_id)에 맞는 카테고리만 필터링
const filteredCategories = computed(() => {
  return categories.value.filter((c) => c.type_id === selectedType.value);
});

// 수입/지출(selectedType)이 변경될 때마다 카테고리를 해당 타입의 첫 번째 값으로 자동 세팅
watch(selectedType, (newType) => {
  const matched = categories.value.filter((c) => c.type_id === newType);
  if (matched.length > 0) {
    form.category_id = matched[0].id;
  } else {
    form.category_id = '';
  }
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
  if (!form.category_id) return showAlert('카테고리를 입력해주세요.');

  await store.addTransaction(form);
  resetForm();
};

// 수정 모드 진입
const selectTransaction = (tx) => {
  Object.assign(form, tx);
  // db.json 일부 데이터에 category로 들어가있는 예외 처리 (수정 시 id 부여)
  if (tx.category && !tx.category_id) form.category_id = String(tx.category);
  else form.category_id = String(tx.category_id);
  // 선택된 내역의 category_id를 바탕으로 수입/지출(selectedType) 역추산해서 맞추기
  const typeId = store.getCategoryType(form.category_id);
  if (typeId) {
    selectedType.value = typeId;
  }

  editMode.value = true;
  editId.value = tx.id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 수정 완료
const handleUpdateTransaction = async () => {
  // 수정 전 과거에 category 키워드를 썼다면 지워주고 db 스키마 통일
  if ('category' in form) delete form.category;
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
  selectedType.value = '1';

  Object.assign(form, {
    date: new Date().toISOString().substr(0, 10),
    amount: '',
    category_id:
      filteredCategories.value.length > 0 ? filteredCategories.value[0].id : '',
    memo: '',
    user_id: '0Lasf-tsJc',
    account_id: accounts.value.length > 0 ? accounts.value[0].id : '',
    id: '',
  });
};

// --- Lifecycle ---
onMounted(async () => {
  await store.fetchTransactions();
  await store.fetchInAndOut();
  await store.fetchCategories();
  await store.fetchAccounts();
  await store.fetchBanks();

  // 초기 등록 시 첫 번째 계좌가 자동으로 선택되도록 설정
  if (accounts.value.length > 0 && !form.account_id) {
    form.account_id = accounts.value[0].id;
  }
  if (filteredCategories.value.length > 0 && !form.category_id) {
    form.category_id = filteredCategories.value[0].id;
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
              <select v-model="form.category_id" class="custom-input">
                <option
                  v-for="c in filteredCategories"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="status-item">
              <div class="status-label-row"><span>수입/지출</span></div>
              <select v-model="selectedType" class="custom-input">
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
                {{ store.getAccountName(acc.id) }}
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
                  store.getCategoryType(tx.category_id) === '1'
                    ? 'income'
                    : 'expense',
                ]"
              >
                {{ store.getCategoryName(tx.category_id).charAt(0) }}
              </div>
              <div>
                <p class="tx-title">
                  {{ store.getCategoryName(tx.category_id) }}
                </p>
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
                  store.getCategoryType(tx.category_id) === '1'
                    ? 'income'
                    : 'expense',
                ]"
              >
                {{ store.getCategoryType(tx.category_id) === '1' ? '+' : '-'
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
