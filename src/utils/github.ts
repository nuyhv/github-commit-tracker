interface Contribution {
  date: string; // 기여 날짜
  count: number; // 커밋 횟수
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: {
    size: number; // 커밋 총 개수
  };
}

interface ContributionData {
  contributions: Contribution[];
  totalCommitsToday: number;
}

export const fetchContributionData = async (username: string): Promise<ContributionData> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`);
    const data: GitHubEvent[] = await response.json(); // GitHubEvent 배열 타입으로 응답 데이터 받기

    const today = new Date();
    const todayDateString = today.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식으로 오늘 날짜 계산

    const contributions: Contribution[] = [];

    // 'PushEvent'만 필터링해서 기여 정보 추출
    data
      .filter((event) => event.type === "PushEvent") // PushEvent만 필터링
      .forEach((event) => {
        const eventDate = event.created_at.split("T")[0]; // "YYYY-MM-DD"
        const existingContribution = contributions.find(
          (contribution) => contribution.date === eventDate
        );

        if (existingContribution) {
          existingContribution.count += event.payload.size; // 같은 날짜의 커밋 개수 합산
        } else {
          contributions.push({
            date: eventDate,
            count: event.payload.size, // 새 날짜에는 커밋 개수 설정
          });
        }
      });

    // 오늘의 커밋량 출력
    const todayContributions = contributions.find(
      (contribution) => contribution.date === todayDateString
    );
    const totalCommitsToday = todayContributions ? todayContributions.count : 0;

    return { contributions, totalCommitsToday };
  } catch (error) {
    console.error("Failed to fetch contribution data:", error);
    return { contributions: [], totalCommitsToday: 0 };
  }
};
