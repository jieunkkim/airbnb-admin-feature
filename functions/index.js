const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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

  while (hasMore && pageNo <= 20) {
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
  const db = admin.firestore();
  const batch = db.batch();
  const collectionRef = db.collection('homestays');

  console.log('💾 Firestore 저장 시작...');

  // 기존 데이터 삭제
  const snapshot = await collectionRef.get();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // 새 데이터 추가
  data.forEach((item, index) => {
    const docRef = collectionRef.doc(item.MGMD_ID || `item_${index}`);
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log(`✅ Firestore 저장 완료: ${data.length}개 항목`);
}

/**
 * Cloud Function: 배치 데이터 수집 및 저장
 */
exports.fetchHomestayData = functions.https.onRequest(async (req, res) => {
  try {
    console.log('🚀 배치 작업 시작...');
    const data = await fetchAllData();
    await saveDataToFirestore(data);

    res.status(200).json({
      success: true,
      message: '배치 작업 완료',
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 배치 작업 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
