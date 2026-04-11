import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// --- 고정 데이터 ---
const beggars = [
  { id: '1', level: 1, name: '뚜벅이', img_path: 'https://github.com/user-attachments/assets/4edfd83f-607a-453a-9746-857231439653', title: '잔고 지키러 뚜벅뚜벅', ment: '숨만 쉬어도 돈이 나가는 세상. 그래도 오늘은 텅장을 무사히 지켜냈어요!' },
  { id: '2', level: 2, name: '따릉이', img_path: 'https://github.com/user-attachments/assets/e0901d61-2a40-4767-ba82-5e8feae0beb9', title: '가성비 탑승 완료', ment: '배달비 아껴서 부자 될 관상. 한 푼 두 푼 세이브하는 재미를 알아버렸네요.' },
  { id: '3', level: 3, name: '오토바이', img_path: 'https://github.com/user-attachments/assets/b0bab4ac-d2dd-470f-9bcd-aac3fda2d8f6', title: '충동구매 회피 만렙', ment: '특가 할인 알림도 요리조리 잘 피해 갑니다. 지출 방어에 제대로 속도가 붙었어요.' },
  { id: '4', level: 4, name: '자동차', img_path: 'https://github.com/user-attachments/assets/80c2d625-9dae-4270-89fb-486cfbc0705c', title: '안정적인 잔고 주행', ment: '웬만한 지름신 유혹에는 창문도 안 내립니다. 통장에 아주 평화로운 시기가 찾아왔어요.' },
  { id: '5', level: 5, name: '사이버트럭', img_path: 'https://github.com/user-attachments/assets/f4e4834c-24f8-435e-82ef-c8f75f7ed8bf', title: '과소비 철벽 방어', ment: '망치로 내리쳐도 안 깨지는 철벽 방어력. 이 폼 그대로 유지하면 조만간 집 삽니다.' },
];

const inandout = [
  { id: '1', name: '수입', type: 'plus' },
  { id: '2', name: '지출', type: 'minus' },
];

const category = [
  { id: '1', name: '용돈', type_id: '1' },
  { id: '2', name: '장학금', type_id: '1' },
  { id: '3', name: '이자', type_id: '1' },
  { id: '4', name: '알바', type_id: '1' },
  { id: '5', name: '식비', type_id: '2' },
  { id: '6', name: '교통비', type_id: '2' },
  { id: '7', name: '쇼핑, 편의점', type_id: '2' },
  { id: '8', name: '의료, 건강', type_id: '2' },
  { id: '9', name: '기타', type_id: '1' },
  { id: '10', name: '기타', type_id: '2' },
];

// --- 가상 사용자 1명 생성 ---
const user = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  phone: faker.phone.number(),
  beg_level: 1,
  current_exp: 0,
  daily_limit: 50000,
  monthly_limit: 1000000,
  total_income: 0,
  total_expense: 0,
  id: faker.string.alphanumeric(11),
  username: faker.person.firstName(),
  join_date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  last_settled_date: new Date().toISOString().split('T')[0],
};

// --- 카테고리별 메모 더미 데이터 (한국어) ---
const categoryMemos = {
  '1': ['이번달 용돈', '아빠가 주심', '엄마한테 받음', ''], // 용돈
  '2': ['성적 장학금', '국가 장학금', '근로 장학금', ''], // 장학금
  '3': ['은행 이자', '적금 만기', '주식 배당금', ''], // 이자
  '4': ['카페 알바비', '편의점 알바', '단기 알바', ''], // 알바
  '5': ['점심 식사', '저녁 약속', '배달음식', '카페', '친구랑 밥', ''], // 식비
  '6': ['버스비', '지하철', '택시비', '교통카드 충전', ''], // 교통비
  '7': ['온라인 쇼핑', '옷 구매', '편의점 간식', '생필품 구매', ''], // 쇼핑, 편의점
  '8': ['병원 진료', '약국', '영양제 구매', ''], // 의료, 건강
  '9': ['중고판매', '보너스', '환급금', ''], // 기타 수입
  '10': ['영화 관람', '친구 선물', '책 구매', '구독료', ''], // 기타 지출
};

// --- 해당 사용자의 거래내역 100개 생성 (2월-4월) ---
const transactions = [];
for (let i = 0; i < 100; i++) {
  const randomCategory = faker.helpers.arrayElement(category);
  const amount = faker.number.int({ min: 1000, max: 150000 });

  // 카테고리에 맞는 메모 목록 가져오기
  const memosForCategory = categoryMemos[randomCategory.id] || [''];

  const transaction = {
    id: faker.string.alphanumeric(11),
    user_id: user.id,
    account_id: faker.helpers.arrayElement(['1', '2', '3']), // 예시 계좌 ID
    category_id: randomCategory.id,
    date: faker.date
      .between({ from: '2026-02-01', to: '2026-04-30' })
      .toISOString()
      .split('T')[0],
    amount: amount,
    memo: faker.helpers.arrayElement(memosForCategory),
  };

  if (randomCategory.type_id === '1') {
    user.total_income += amount;
  } else {
    user.total_expense += amount;
  }

  transactions.push(transaction);
}

// --- 최종 DB 객체 조합 ---
const db = {
  users: [user],
  beggars,
  transactions,
  inandout,
  category,
  $schema: './node_modules/json-server/schema.json',
};

// --- db.json 파일 작성 ---
const dbPath = path.join(process.cwd(), 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`✅ ${user.username} 사용자의 거래내역 ${transactions.length}개를 생성했습니다.`);
console.log(`✅ db.json 파일이 성공적으로 업데이트되었습니다: ${dbPath}`);
