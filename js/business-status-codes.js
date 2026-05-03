/* 영업상태 코드 매핑 (행정안전부) */
const BUSINESS_STATUS_CODES = {
  '영업/정상': '01',
  '휴업': '02',
  '폐업': '03',
  '취소/말소/만료/정지/중지': '04',
  '제외/삭제/전출': '05',
  '기타': '06',
};

/**
 * 영업상태명으로 코드 조회
 * @param {string} statusName - 영업상태명
 * @returns {string} 코드값
 */
function getBusinessStatusCode(statusName) {
  return BUSINESS_STATUS_CODES[statusName] || '';
}

/**
 * 코드로 상태명 조회 (역함수)
 * @param {string} code - 코드값 (01, 02, 03 등)
 * @returns {string} 영업상태명
 */
function getBusinessStatusName(code) {
  const status = Object.entries(BUSINESS_STATUS_CODES).find(([, c]) => c === code);
  return status ? status[0] : '';
}

/**
 * 영업상태 코드 전체 목록
 * @returns {Object} 상태코드 객체
 */
function getAllBusinessStatuses() {
  return BUSINESS_STATUS_CODES;
}
