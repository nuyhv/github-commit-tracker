import { sendCommitCountToDiscord } from "./utils/discord";
import { fetchContributionData } from "./utils/github";

// 크롬 알람 (매일 21:00 자동 실행)
chrome.alarms.create("commitTracker", {
  when: getNextTriggerTime(21, 0),
  periodInMinutes: 1440,
});

chrome.alarms.onAlarm.addListener(() => sendCommitToDiscord());

// 사용자가 "지금 보내기" 버튼을 누르면 실행
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "send_commit_now") {
    sendCommitToDiscord();
  }
});

// 커밋 개수를 가져와서 디스코드로 전송
async function sendCommitToDiscord() {
  chrome.storage.sync.get(["discordWebhook", "githubUsername"], async (data) => {
    if (!data.discordWebhook || !data.githubUsername) {
      console.warn("웹훅 URL 또는 GitHub ID가 설정되지 않음.");
      return;
    }

    const fetchData = await fetchContributionData(data.githubUsername);
    if (fetchData !== null) {
      await sendCommitCountToDiscord(
        data.discordWebhook,
        data.githubUsername,
        fetchData.totalCommitsToday
      );
    }
  });
}

// 다음 실행 시간 계산
function getNextTriggerTime(hours: number, minutes: number) {
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (now.getTime() > target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
}
