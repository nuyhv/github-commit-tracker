import { useEffect, useState } from "react";

const DiscordWebhook = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const sendNow = () => {
    chrome.runtime.sendMessage({ action: "send_commit_now" });
  };

  // 저장된 웹훅 URL 불러오기
  useEffect(() => {
    chrome.storage.sync.get("discordWebhook", (data) => {
      if (data.discordWebhook) {
        setWebhookUrl(data.discordWebhook);
      }
    });
  }, []);

  // 웹훅 URL 저장 함수
  const saveWebhookUrl = () => {
    chrome.storage.sync.set({ discordWebhook: webhookUrl }, () => {
      alert("✅ 웹훅 URL이 저장되었습니다!");
    });
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold text-center">디스코드 웹훅 설정</h2>
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded mt-2"
        placeholder="웹훅 URL 입력"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 mt-2 w-full rounded transition cursor-pointer"
        onClick={saveWebhookUrl}
      >
        저장
      </button>
      <button
        className="bg-green-500 hover:bg-green-600 text-white p-2 mt-2 w-full rounded transition cursor-pointer"
        onClick={sendNow}
      >
        지금 보내기
      </button>
    </div>
  );
};

export default DiscordWebhook;
