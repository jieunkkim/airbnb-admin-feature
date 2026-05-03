/**
 * API 데이터에서 중복된 MNG_NO 확인
 * 실행: node scripts/check-duplicate-ids.js
 */

const API_KEY = '13975442ce0832bbf042aab5064909e38fb717167213168ca3b81d484b7662d1';
const API_URL = 'https://apis.data.go.kr/1741000/foreigner_city_homestays/info';

async function checkDuplicateIds() {
  let allIds = new Map(); // ID -> count
  let pageNo = 1;
  let hasMore = true;
  let totalCount = 0;

  console.log('🔍 API 데이터에서 중복 ID 확인 중...\n');

  while (hasMore) {
    try {
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

        items.forEach(item => {
          const id = item.MNG_NO;
          if (id) {
            allIds.set(id, (allIds.get(id) || 0) + 1);
          }
        });

        totalCount = parseInt(json.response.body.totalCount) || 0;
        hasMore = pageNo * 100 < totalCount;
        pageNo++;

        process.stdout.write(`\r페이지 ${pageNo - 1}... (${Math.min((pageNo - 1) * 100, totalCount)}/${totalCount})`);

        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('❌ 오류:', error.message);
      hasMore = false;
    }
  }

  console.log('\n\n═════════════════════════════════════════════');
  console.log('📊 분석 결과');
  console.log('═════════════════════════════════════════════\n');

  const uniqueIds = allIds.size;
  const duplicates = Array.from(allIds.entries()).filter(([id, count]) => count > 1);

  console.log(`총 항목 수: ${totalCount}개`);
  console.log(`고유 ID 수: ${uniqueIds}개`);
  console.log(`중복된 ID 개수: ${duplicates.length}개\n`);

  if (duplicates.length > 0) {
    console.log('⚠️  중복된 ID 목록 (상위 10개):');
    duplicates.slice(0, 10).forEach(([id, count]) => {
      console.log(`   ${id}: ${count}개`);
    });
    if (duplicates.length > 10) {
      console.log(`   ... 외 ${duplicates.length - 10}개`);
    }
  } else {
    console.log('✅ 중복된 ID가 없습니다!');
  }

  console.log('\n═════════════════════════════════════════════');
}

checkDuplicateIds();
