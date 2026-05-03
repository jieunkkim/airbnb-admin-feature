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
 * 필요한 필드만 추출 (필수 필드 없으면 null 반환)
 */
function extractRequiredFields(item) {
  if (!item.MNG_NO) {
    return null;
  }
  return {
    MGMD_ID: item.MNG_NO,
    BPLC_NM: item.BPLC_NM || '',
    ROAD_NM_ADDR: item.ROAD_NM_ADDR || '',
    LOTNO_ADDR: item.LOTNO_ADDR || '',
    SALS_STTS_NM: item.DTL_SALS_STTS_NM || '',
    LCPMT_YMD: item.LCPMT_YMD || '',
    BLDG_USG_NM: item.BLDG_USG_NM || '',
    GSRM_CNT: item.GSRM_CNT || 0,
    FCLT_SCL: item.FCLT_SCL || ''
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

        // 첫 페이지에서 실제 필드명 확인
        if (pageNo === 1) {
          console.log('\n📋 API 응답 구조 (첫 번째 항목):');
          console.log(JSON.stringify(items[0], null, 2));
          console.log('');
        }

        // 필요한 필드만 추출 및 필수 필드 없는 항목 필터링
        const filteredItems = items.map(extractRequiredFields).filter(item => item !== null);
        const skippedCount = items.length - filteredItems.length;
        if (skippedCount > 0) {
          console.log(`   ⚠️  ${skippedCount}개 필터링됨 (필수 필드 없음)`);
        }
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
 * 임시 컬렉션에 데이터 저장 (스트리밍 방식)
 */
async function saveDataToFirestore(data) {
  const tempCollectionRef = db.collection('homestays_temp');
  const mainCollectionRef = db.collection('homestays');
  const BATCH_SIZE = 50;

  try {
    console.log('💾 임시 컬렉션에 데이터 저장 시작...');

    // 1️⃣ 기존 임시 컬렉션 정리 (있다면)
    const tempSnapshot = await tempCollectionRef.get();
    if (tempSnapshot.size > 0) {
      console.log(`   ⚠️  기존 임시 데이터 ${tempSnapshot.size}개 삭제`);
      let deleteBatch = db.batch();
      let deleteCount = 0;

      tempSnapshot.forEach(doc => {
        deleteBatch.delete(doc.ref);
        deleteCount++;
        if (deleteCount % BATCH_SIZE === 0) {
          deleteBatch.commit();
          deleteBatch = db.batch();
        }
      });

      if (deleteCount % BATCH_SIZE > 0) {
        await deleteBatch.commit();
      }
    }

    // 2️⃣ 새 데이터를 임시 컬렉션에 저장 (스트리밍) - 순차 ID 사용
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = data.slice(i, i + BATCH_SIZE);
      let writeBatch = db.batch();

      chunk.forEach((item, chunkIndex) => {
        const docId = `item_${String(i + chunkIndex + 1).padStart(5, '0')}`;
        const docRef = tempCollectionRef.doc(docId);
        writeBatch.set(docRef, item);
      });

      await writeBatch.commit();
      const progress = Math.min(i + BATCH_SIZE, data.length);
      console.log(`   ✓ ${progress}/${data.length} 저장 완료`);
    }

    console.log('✅ 임시 컬렉션 저장 완료');

    // 3️⃣ 기존 컬렉션 삭제 (전환 전 임시 컬렉션 실제 개수 확인)
    const actualTempCount = await tempCollectionRef.get();
    console.log(`\n📊 임시 컬렉션 실제 저장 개수: ${actualTempCount.size}개\n`);

    console.log('🗑️  기존 데이터 삭제 시작...');
    const mainSnapshot = await mainCollectionRef.get();
    let deleteBatch = db.batch();
    let deleteCount = 0;

    mainSnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
      deleteCount++;
      if (deleteCount % BATCH_SIZE === 0) {
        deleteBatch.commit();
        deleteBatch = db.batch();
      }
    });

    if (deleteCount % BATCH_SIZE > 0) {
      await deleteBatch.commit();
    }

    console.log(`✅ 기존 데이터 ${mainSnapshot.size}개 삭제 완료`);

    // 4️⃣ 임시 → 정식으로 변경 (문서 복사)
    console.log('🔄 데이터 전환 중...');
    const tempData = await tempCollectionRef.get();
    for (let i = 0; i < tempData.docs.length; i += BATCH_SIZE) {
      const chunk = tempData.docs.slice(i, i + BATCH_SIZE);
      let copyBatch = db.batch();

      chunk.forEach(doc => {
        const mainRef = mainCollectionRef.doc(doc.id);
        copyBatch.set(mainRef, doc.data());
      });

      await copyBatch.commit();
      const progress = Math.min(i + BATCH_SIZE, tempData.docs.length);
      console.log(`   ✓ ${progress}/${tempData.docs.length} 전환 완료`);
    }

    console.log('✅ 데이터 전환 완료');

    // 5️⃣ 임시 컬렉션 삭제
    console.log('🗑️  임시 컬렉션 삭제...');
    const finalTempSnapshot = await tempCollectionRef.get();
    deleteBatch = db.batch();
    deleteCount = 0;

    finalTempSnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
      deleteCount++;
      if (deleteCount % BATCH_SIZE === 0) {
        deleteBatch.commit();
        deleteBatch = db.batch();
      }
    });

    if (deleteCount % BATCH_SIZE > 0) {
      await deleteBatch.commit();
    }

    console.log('✅ 임시 컬렉션 정리 완료\n');

    // 6️⃣ 메타데이터 업데이트
    const metadataRef = db.collection('metadata').doc('lastUpdate');
    await metadataRef.set({
      lastUpdated: new Date().toISOString(),
      itemCount: data.length
    });
    console.log('✅ 메타데이터 저장 완료');
  } catch (error) {
    console.error(`❌ Firestore 저장 오류:`, error.message);
    console.log('🔄 실패 시 임시 컬렉션 정리...');

    // 실패 시 임시 컬렉션만 삭제
    try {
      const cleanupSnapshot = await tempCollectionRef.get();
      let cleanupBatch = db.batch();
      let cleanupCount = 0;

      cleanupSnapshot.forEach(doc => {
        cleanupBatch.delete(doc.ref);
        cleanupCount++;
        if (cleanupCount % BATCH_SIZE === 0) {
          cleanupBatch.commit();
          cleanupBatch = db.batch();
        }
      });

      if (cleanupCount % BATCH_SIZE > 0) {
        await cleanupBatch.commit();
      }

      console.log('✅ 임시 컬렉션 정리 완료 (기존 데이터 유지)');
    } catch (cleanupError) {
      console.error('❌ 임시 컬렉션 정리 실패:', cleanupError.message);
    }

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
