/**
 * 배치: 공공데이터포털 외국인 도시 민박업 전체 데이터 수집
 * 용도: 매일 아침 실행해서 JSON 파일로 저장
 *
 * 실행: node scripts/batch-fetch-homestay-data.js
 */

const fs = require('fs');
const path = require('path');

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
    SALS_STTS_CD: item.SALS_STTS_CD || '',
    SALS_STTS_NM: item.SALS_STTS_NM || '',
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

        // 필요한 필드만 추출 및 필수 필드 없는 항목 필터링
        const filteredItems = items.map(extractRequiredFields).filter(item => item !== null);
        allItems = allItems.concat(filteredItems);

        totalCount = parseInt(json.response.body.totalCount) || 0;
        hasMore = (pageNo - 1) * 100 < totalCount;

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
 * 데이터를 JSON 파일로 저장
 */
async function saveDataToJsonFile(data) {
  try {
    console.log('💾 JSON 파일 저장 중...');

    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'homestays.json');

    // data 디렉토리 생성 (없으면)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('   📁 data 디렉토리 생성');
    }

    // 메타데이터와 함께 저장
    const fileData = {
      metadata: {
        itemCount: data.length
      },
      items: data
    };

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
    console.log(`✅ JSON 파일 저장 완료: ${data.length}개 항목`);
    console.log(`   📄 파일 경로: ${filePath}`);
  } catch (error) {
    console.error(`❌ JSON 파일 저장 오류:`, error.message);
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
    await saveDataToJsonFile(data);

    console.log('═════════════════════════════════════════════');
    console.log('✨ 배치 작업 완료!');
    console.log('═════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ 배치 작업 실패:', error);
    process.exit(1);
  }
}

main();
