import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useTransactionStore = defineStore('transaction', () => {
  // --- State (상태) ---
  const transactions = ref([]);
  const inandout = ref([]);
  const accounts = ref([]);
  const currentSort = ref('date');

  // --- Getters (계산된 상태) ---
  const displayTransactions = computed(() => {
    const list = [...transactions.value];
    if (currentSort.value === 'date') {
      // 최신 날짜순 (날짜가 같으면 최신 ID순)
      return list.sort(
        (a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id,
      );
    } else {
      // 금액 높은순
      return list.sort((a, b) => b.amount - a.amount);
    }
  });

  const getAccountName = computed(() => {
    return (id) => {
      const found = accounts.value.find((a) => a.id === String(id));
      return found ? found.bank : '알 수 없는 계좌';
    };
  });

  // --- Actions (메서드) ---
  const setSort = (type) => {
    currentSort.value = type;
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      transactions.value = res.data;
    } catch (err) {
      console.error('거래내역 로드 실패', err);
    }
  };

  const fetchInAndOut = async () => {
    try {
      const res = await api.get('/inandout');
      inandout.value = res.data;
    } catch (err) {
      console.error('공통코드 로드 실패', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      accounts.value = res.data;
    } catch (err) {
      console.error('계좌 로드 실패', err);
    }
  };

  const addTransaction = async (payload) => {
    await api.post('/transactions', payload);
    await fetchTransactions(); // 저장 후 목록 갱신
  };

  const updateTransaction = async (id, payload) => {
    await api.put(`/transactions/${id}`, payload);
    await fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  return {
    transactions,
    inandout,
    accounts,
    currentSort,
    displayTransactions,
    getAccountName,
    setSort,
    fetchTransactions,
    fetchInAndOut,
    fetchAccounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
