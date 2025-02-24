export const fetchContributionData = async (username: string) => {
  try {
    const response = await fetch(`https://github.com/users/${username}/contributions`);
    const text = await response.text();

    // 잔디 데이터 파싱
    const matches = [...text.matchAll(/data-count="(\d+)" data-date="([\d-]+)"/g)];
    const contributions = matches.map((match) => ({
      date: match[2],
      count: parseInt(match[1], 10),
    }));

    return contributions;
  } catch (error) {
    console.error("Failed to fetch contribution data:", error);
    return [];
  }
};
