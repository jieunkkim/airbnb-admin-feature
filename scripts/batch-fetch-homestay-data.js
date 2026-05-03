/**
 * 배치: 공공데이터포털 외국인 도시 민박업 전체 데이터 수집
 * 용도: 매일 아침 실행해서 전체 데이터를 JSON으로 저장
 *
 * 실행: node scripts/batch-fetch-homestay-data.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '13975442ce0832bbf042aab5064909e38fb717167213168ca3b81d484b7662d1';
const API_URL = 'https://apis.data.go.kr/1741000/foreigner_city_homestays/info';
const OUTPUT_FILE = path.join(__dirname, '../data/homestay-data.json');

// data 폴더 없으면 생성
const dataDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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
 * 데이터를 JSON으로 저장
 */
async function saveData(data) {
  try {
    // 타임스탬프 추가
    const output = {
      lastUpdated: new Date().toISOString(),
      totalCount: data.length,
      items: data
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`💾 저장 완료: ${OUTPUT_FILE}`);
    console.log(`   파일 크기: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB\n`);
  } catch (error) {
    console.error(`❌ 저장 오류: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log('═════════════════════════════════════════════');
  console.log('🏠 외국인 도시 민박업 데이터 배치 수집');
  console.log('═════════════════════════════════════════════\n');

  const data = await fetchAllData();
  await saveData(data);

  console.log('═════════════════════════════════════════════');
  console.log('✨ 배치 작업 완료!');
  console.log('═════════════════════════════════════════════');
}

main().catch(error => {
  console.error('❌ 배치 작업 실패:', error);
  process.exit(1);
});
