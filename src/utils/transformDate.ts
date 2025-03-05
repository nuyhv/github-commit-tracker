export const transformDate = (isoString: string): string => {
  const date = new Date(isoString);

  // 한국 시간 (KST) 기준으로 변환
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth()는 0부터 시작
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};
