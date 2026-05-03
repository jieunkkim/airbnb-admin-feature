/**
 * Firestore 컬렉션 문서 개수 확인
 * 실행: node scripts/check-firestore-count.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json');

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCollectionCount() {
  try {
    // homestays 컬렉션 문서 개수
    const homestaysSnapshot = await db.collection('homestays').get();
    const homestaysCount = homestaysSnapshot.size;

    // metadata에서 마지막 업데이트 정보
    const metadataDoc = await db.collection('metadata').doc('lastUpdate').get();
    const metadata = metadataDoc.data();

    console.log('═════════════════════════════════════════════');
    console.log('📊 Firestore 데이터 현황');
    console.log('═════════════════════════════════════════════\n');

    console.log(`📁 homestays 컬렉션: ${homestaysCount}개 문서`);

    if (metadata) {
      console.log(`\n📅 마지막 업데이트:`);
      console.log(`   시간: ${metadata.lastUpdated}`);
      console.log(`   항목 수: ${metadata.itemCount}개`);
    }

    console.log('\n═════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await admin.app().delete();
  }
}

checkCollectionCount();
