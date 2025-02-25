export async function sendCommitCountToDiscord(
  webhookUrl: string,
  username: string,
  commitCount: number
) {
  if (!webhookUrl) {
    console.error("Discord Webhook URL이 설정되지 않았습니다.");
    return;
  }

  const payload = {
    username: "GitHub Commit Tracker",
    content: `📢 **${username}** 님의 오늘 커밋 수: **${commitCount}** 🔥`,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("디스코드로 메시지 전송 성공!");
    } else {
      console.error("디스코드 메시지 전송 실패:", response.statusText);
    }
  } catch (error) {
    console.error("디스코드 전송 중 오류 발생:", error);
  }
}
