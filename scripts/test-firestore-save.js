/**
 * Firestore 저장 함수만 테스트하는 스크립트
 * 실행: node scripts/test-firestore-save.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

    // 2️⃣ 새 데이터를 임시 컬렉션에 저장 (스트리밍)
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = data.slice(i, i + BATCH_SIZE);
      let writeBatch = db.batch();

      chunk.forEach((item, chunkIndex) => {
        const docId = item.MGMD_ID || `item_${i + chunkIndex}`;
        const docRef = tempCollectionRef.doc(docId);
        writeBatch.set(docRef, item);
      });

      await writeBatch.commit();
      const progress = Math.min(i + BATCH_SIZE, data.length);
      console.log(`   ✓ ${progress}/${data.length} 저장 완료`);
    }

    console.log('✅ 임시 컬렉션 저장 완료');

    // 3️⃣ 기존 컬렉션 삭제
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
 * 테스트 데이터 생성
 */
function generateTestData(count = 20) {
  const testData = [];
  for (let i = 1; i <= count; i++) {
    testData.push({
      MGMD_ID: `TEST_${String(i).padStart(5, '0')}`,
      BPLC_NM: `테스트 민박 ${i}`,
      ROAD_NM_ADDR: `서울시 강남구 테스트로 ${i}`,
      LOTNO_ADDR: `서울시 강남구 테스트동 ${i}-1`,
      SALS_STTS_NM: i % 2 === 0 ? '정상' : '폐업',
      LCPMT_YMD: '20230101',
      BLDG_USG_NM: '주택',
      GSRM_CNT: String(Math.floor(Math.random() * 5) + 1),
      FCLT_SCL: i % 3 === 0 ? '소' : i % 3 === 1 ? '중' : '대'
    });
  }
  return testData;
}

/**
 * 메인 실행
 */
async function main() {
  console.log('═════════════════════════════════════════════');
  console.log('🧪 Firestore 저장 함수 테스트');
  console.log('═════════════════════════════════════════════\n');

  try {
    const testData = generateTestData(20);
    console.log(`📊 테스트 데이터 생성: ${testData.length}개 항목\n`);

    await saveDataToFirestore(testData);

    console.log('\n═════════════════════════════════════════════');
    console.log('✨ 테스트 완료!');
    console.log('═════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

main();
