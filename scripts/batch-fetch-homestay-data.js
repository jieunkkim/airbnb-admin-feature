/**
 * 배치: 공공데이터포털 외국인 도시 민박업 전체 데이터 수집
 * 용도: 매일 아침 실행해서 Firestore에 저장
 *
 * 실행: node scripts/batch-fetch-homestay-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const API_KEY = '13975442ce0832bbf042aab5064909e38fb717167213168ca3b81d484b7662d1';
const API_URL = 'https://apis.data.go.kr/1741000/foreigner_city_homestays/info';

/**
 * 모든 데이터를 페이징으로 가져오기
 */
async function fetchAllData() {
  let allItems = [];
  let pageNo = 1;
  let hasMore = true;
  let totalCount = 0;

  console.log('📊 데이터 수집 시작...');

  while (hasMore) {
    try {
      console.log(`📄 페이지 ${pageNo} 요청 중... (${allItems.length}/${totalCount || '?'} 수집됨)`);

      const params = new URLSearchParams({
        serviceKey: API_KEY,
        numOfRows: '100',
        pageNo: pageNo.toString(),
        type: 'json'
      });

      const url = `${API_URL}?${params.toString()}`;
      const resp = await fetch(url);
      const json = await resp.json();

      if (json.response?.body?.items?.item) {
        const items = Array.isArray(json.response.body.items.item)
          ? json.response.body.items.item
          : [json.response.body.items.item];

        allItems = allItems.concat(items);

        totalCount = parseInt(json.response.body.totalCount) || 0;
        hasMore = allItems.length < totalCount;

        console.log(`   ✓ ${items.length}개 추가 (누적: ${allItems.length}개)`);
        pageNo++;

        // API 부하 방지: 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        hasMore = false;
        console.log('   ⚠️  더 이상 데이터 없음');
      }
    } catch (error) {
      console.error(`❌ 페이지 ${pageNo} 오류:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n✅ 수집 완료: 총 ${allItems.length}개 항목\n`);
  return allItems;
}

/**
 * Firestore에 데이터 저장
 */
async function saveDataToFirestore(data) {
  try {
    const batch = db.batch();
    const collectionRef = db.collection('homestays');

    console.log('💾 Firestore 저장 시작...');

    // 기존 데이터 모두 삭제
    const snapshot = await collectionRef.get();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    console.log(`   기존 ${snapshot.size}개 항목 삭제`);

    // 새 데이터 추가
    data.forEach((item, index) => {
      // 문서 ID: API에서 제공하는 고유 ID 또는 인덱스
      const docId = item.MGMD_ID || `item_${index}`;
      const docRef = collectionRef.doc(docId);
      batch.set(docRef, item);
    });

    await batch.commit();
    console.log(`✅ Firestore 저장 완료: ${data.length}개 항목\n`);

    // 메타데이터(마지막 업데이트 시간) 저장
    const metadataRef = db.collection('metadata').doc('lastUpdate');
    await metadataRef.set({
      lastUpdated: new Date().toISOString(),
      itemCount: data.length
    });
    console.log('✅ 메타데이터 저장 완료');
  } catch (error) {
    console.error(`❌ Firestore 저장 오류:`, error.message);
    throw error;
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log('═════════════════════════════════════════════');
  console.log('🏠 외국인 도시 민박업 데이터 배치 수집');
  console.log('═════════════════════════════════════════════\n');

  try {
    const data = await fetchAllData();
    await saveDataToFirestore(data);

    console.log('═════════════════════════════════════════════');
    console.log('✨ 배치 작업 완료!');
    console.log('═════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ 배치 작업 실패:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

main();
