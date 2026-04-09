import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useTransactionStore = defineStore('transaction', () => {
  // --- State (상태) ---
  const transactions = ref([]); // 거래내역
  const inandout = ref([]); // 수입, 지출
  const accounts = ref([]); // 계좌 정보
  const categories = ref([]); // 카테고리 정보
  const currentSort = ref('date'); // 현재 조회 정렬 방식

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

  // 계좌 은행명
  const getAccountName = computed(() => {
    return (id) => {
      const found = accounts.value.find((a) => a.id === String(id));
      return found ? found.bank : '알 수 없는 계좌';
    };
  });

  // 카테고리 이름 가져오기 (추가)
  const getCategoryName = computed(() => {
    return (categoryId) => {
      const found = categories.value.find((c) => c.id === String(categoryId));
      return found ? found.name : '기타';
    };
  });
  // 카테고리 ID를 통해 수입/지출(type_id) 판별하기 (추가)
  const getCategoryType = computed(() => {
    return (categoryId) => {
      const found = categories.value.find((c) => c.id === String(categoryId));
      return found ? found.type_id : null; // '1': 수입, '2': 지출
    };
  });

  // --- Actions (메서드) ---

  // 조회 정렬 방식 변경
  const setSort = (type) => {
    currentSort.value = type;
  };

  // 거래 내역 가져오기
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      transactions.value = res.data;
    } catch (err) {
      console.error('거래내역 로드 실패', err);
    }
  };

  // 수입, 지출 방식 가져오기
  const fetchInAndOut = async () => {
    try {
      const res = await api.get('/inandout');
      inandout.value = res.data;
    } catch (err) {
      console.error('공통코드 로드 실패', err);
    }
  };

  // 계좌 정보 가져오기
  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      accounts.value = res.data;
    } catch (err) {
      console.error('계좌 로드 실패', err);
    }
  };

  // 카테고리 정보 가져오기 (추가)
  const fetchCategories = async () => {
    try {
      const res = await api.get('/category');
      categories.value = res.data;
    } catch (err) {
      console.error('카테고리 로드 실패', err);
    }
  };

  // 거래 내역 추가
  const addTransaction = async (payload) => {
    await api.post('/transactions', payload);
    await fetchTransactions(); // 저장 후 목록 갱신
  };

  // 거래 내역 업데이트
  const updateTransaction = async (id, payload) => {
    await api.put(`/transactions/${id}`, payload);
    await fetchTransactions();
  };

  // 거래 내역 삭제
  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  return {
    transactions,
    inandout,
    accounts,
    categories,
    currentSort,
    displayTransactions,
    getAccountName,
    getCategoryName,
    getCategoryType,
    setSort,
    fetchTransactions,
    fetchInAndOut,
    fetchAccounts,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
