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
 * 필요한 필드만 추출
 */
function extractRequiredFields(item) {
  return {
    MGMD_ID: item.MGMD_ID,
    BPLC_NM: item.BPLC_NM,
    ROAD_NM_ADDR: item.ROAD_NM_ADDR,
    LOTNO_ADDR: item.LOTNO_ADDR,
    SALS_STTS_NM: item.SALS_STTS_NM,
    LCPMT_YMD: item.LCPMT_YMD,
    BLDG_USG_NM: item.BLDG_USG_NM,
    GSRM_CNT: item.GSRM_CNT,
    FCLT_SCL: item.FCLT_SCL
  };
}

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

        // 필요한 필드만 추출
        const filteredItems = items.map(extractRequiredFields);
        allItems = allItems.concat(filteredItems);

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
 * Firestore에 데이터 저장 (배치 단위로 나누어 저장)
 */
async function saveDataToFirestore(data) {
  try {
    const collectionRef = db.collection('homestays');
    const BATCH_SIZE = 200; // 더 작은 청크로 나누어 저장

    console.log('💾 Firestore 저장 시작...');

    // 기존 데이터 모두 삭제
    const snapshot = await collectionRef.get();
    let deleteBatch = db.batch();
    let deleteCount = 0;

    snapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
      deleteCount++;

      if (deleteCount % BATCH_SIZE === 0) {
        // 배치 커밋하고 새 배치 시작
        deleteBatch.commit();
        deleteBatch = db.batch();
      }
    });

    if (deleteCount % BATCH_SIZE > 0) {
      await deleteBatch.commit();
    }

    console.log(`   기존 ${snapshot.size}개 항목 삭제 완료`);

    // 새 데이터 추가 (배치 단위로 나누어 저장)
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = data.slice(i, i + BATCH_SIZE);
      let writeBatch = db.batch();

      chunk.forEach((item, chunkIndex) => {
        const docId = item.MGMD_ID || `item_${i + chunkIndex}`;
        const docRef = collectionRef.doc(docId);
        writeBatch.set(docRef, item);
      });

      await writeBatch.commit();
      console.log(`   ✓ ${Math.min(i + BATCH_SIZE, data.length)}/${data.length} 저장 완료`);
    }

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
