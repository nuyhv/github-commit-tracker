interface Contribution {
  date: string; // 기여 날짜 (YYYY-MM-DD)
  count: number; // 커밋 횟수
}

const ContributionGrid = ({ contributions }: { contributions: Contribution[] }) => {
  const today = new Date();

  // 7일 전부터 오늘까지의 날짜 목록 생성
  const dateRange = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  // 날짜별 커밋 데이터 매핑 (없으면 0)
  const mappedData = dateRange.map((date) => {
    const contribution = contributions.find((c) => c.date === date);
    return { date, count: contribution ? contribution.count : 0 };
  });

  // 최신 날짜가 우측에 위치하도록 정렬
  const gridData = mappedData;

  // 커밋 개수에 따라 색상 지정
  const getLevelClass = (count: number) => {
    if (count > 20) return "bg-green-700";
    if (count > 10) return "bg-green-500";
    if (count > 5) return "bg-green-300";
    if (count > 0) return "bg-green-100";
    return "bg-gray-200";
  };

  return (
    <div className="flex space-x-1 mt-4 justify-center">
      {gridData.map((contribution, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-sm ${getLevelClass(contribution.count)}`}
          title={`${contribution.date}: ${contribution.count} ${
            contribution.count === 1 ? "commit" : "commits"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default ContributionGrid;
