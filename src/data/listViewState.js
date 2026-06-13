// 리스트 화면 상태(카테고리·필터·정렬) 세션 보존
// - 상세/비교함 등으로 이동 후 뒤로 돌아오면 리스트가 다시 마운트되며 로컬 state가 초기화됨
// - 설정한 정렬/카테고리/필터가 사라지지 않도록 sessionStorage에 보관했다가 복원
const KEY = 'list_view_state';

export function loadListViewState() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveListViewState(state) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 불가(프라이빗 모드·용량 초과 등) 시 무시
  }
}
