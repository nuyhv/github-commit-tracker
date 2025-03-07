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
  actor: {
    avatar_url: string;
    display_login: string;
  };
}

interface ContributionData {
  contributions: Contribution[];
  totalCommitsToday: number;
  lastUpdated: string | null; // 마지막 업데이트 시간 추가
  avatarURL: string | undefined; // 아바타 url 추가
  userName: string | undefined;
}

// github user contribution data 불러오기
export const fetchContributionData = async (username: string): Promise<ContributionData> => {
  try {
    console.log("📢 GitHub API 요청 시작:", username);

    const response = await fetch(`https://api.github.com/users/${username}/events`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`존재하지 않는 Github 계정입니다.`);
      } else throw new Error(`GitHub API Error: ${response.status} - ${response.statusText}`);
    }

    const data: GitHubEvent[] = await response.json();

    if (data.length === 0) {
      throw new Error("GitHub 활동 내역이 없습니다.");
    }

    const pushEvents = data.filter((event) => event.type === "PushEvent");

    if (pushEvents.length === 0) {
      throw new Error("최근 90일 내에 커밋 기록이 없습니다.");
    }

    const avatarURL = pushEvents[0].actor.avatar_url;
    const userName = pushEvents[0].actor.display_login;

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD" 형식으로 오늘 날짜 계산
    let lastUpdated: string | null = null; // 마지막 업데이트 시간

    // PushEvent만 필터링하고 날짜별 커밋 개수를 집계
    const contributions = pushEvents.reduce<Record<string, number>>((acc, event) => {
      const eventDate = event.created_at.split("T")[0]; // "YYYY-MM-DD"
      acc[eventDate] = (acc[eventDate] || 0) + event.payload.size;

      if (!lastUpdated || new Date(event.created_at) > new Date(lastUpdated)) {
        lastUpdated = event.created_at;
      }
      return acc;
    }, {});

    const totalCommitsToday = contributions[today] || 0;

    // 배열 형태로 변환
    const contributionsArray: Contribution[] = Object.entries(contributions).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    console.log("✅ GitHub 데이터 파싱 완료:", contributionsArray);

    return {
      contributions: contributionsArray,
      totalCommitsToday,
      lastUpdated,
      avatarURL,
      userName,
    };
  } catch (error) {
    console.error("❌ GitHub 데이터 가져오기 실패:", error);

    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error("예기치 못한 오류 발생");
    }
  }
};
