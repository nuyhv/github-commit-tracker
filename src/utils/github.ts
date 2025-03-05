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
  lastUpdated: string | null; // 마지막 업데이트 시간 추가
}

export const fetchContributionData = async (username: string): Promise<ContributionData> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`);

    if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);

    const data: GitHubEvent[] = await response.json();

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD" 형식으로 오늘 날짜 계산
    let lastUpdated: string | null = null; // 마지막 업데이트 시간

    // PushEvent만 필터링하고 날짜별 커밋 개수를 집계
    const contributions = data
      .filter((event) => event.type === "PushEvent")
      .reduce<Record<string, number>>((acc, event) => {
        const eventDate = event.created_at.split("T")[0]; // "YYYY-MM-DD"
        acc[eventDate] = (acc[eventDate] || 0) + event.payload.size;

        if (!lastUpdated || new Date(event.created_at) > new Date(lastUpdated)) {
          lastUpdated = event.created_at;
        }
        return acc;
      }, {});

    // 오늘의 커밋량 가져오기
    const totalCommitsToday = contributions[today] || 0;

    // 배열 형태로 변환
    const contributionsArray: Contribution[] = Object.entries(contributions).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    return { contributions: contributionsArray, totalCommitsToday, lastUpdated };
  } catch (error) {
    console.error("❌ Failed to fetch contribution data:", error);
    return { contributions: [], totalCommitsToday: 0, lastUpdated: null };
  }
};
