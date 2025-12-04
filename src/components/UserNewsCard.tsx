import { News } from "../types/News";
import "./UserNewsCard.css"

interface Props {
  item: News;
}


export default function UserNewsCard({item}: Props) {
  // 키워드 파싱 함수
  const parseKeywords = (keywordString: string | undefined): string[] => {
    if (!keywordString) return [];
    return keywordString
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);
  };

  const keywords = parseKeywords(item.keywords);


  // 날짜 포맷 함수
  const formatDate = (value: string | number | Date | number[] | undefined) => {
    if (!value) return "날짜 정보 없음";

    let date: Date;

    // [YYYY, M, D] 배열 형태 처리
    if (Array.isArray(value)) {
      const [year, month, day, hour = 0, min = 0] = value;
      date = new Date(year, month - 1, day, hour, min);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return "날짜 오류";

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간 표시
    });
  };

  const renderSentiment = (s?: string) => {
    switch (s) {
      case "긍정":
        return <span className="sentiment positive">긍정</span>;
      case "부정":
        return <span className="sentiment negative">부정</span>;
      default:
        return <span className="sentiment neutral">중립</span>;
    }
  }

  return (
    <div className="user-news-card">
      <img
        src={item.imageUrl}
        alt={item.title}
        className="user-news-thumbnail"
      />
      <div className="user-news-content">
        <a
          href={item.originalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="news-title-link"
        >
          <h2 className="news-title">{item.title}</h2>
        </a>

        {keywords.length > 0 && (
          <div
            className="news-keywords"
            style={{ marginBottom: "5px", textAlign: "left" }}
          >
            {keywords.map((k, idx) => (
              <span key={idx} className="keyword">
                #{k}{" "}
              </span>
            ))}
          </div>
        )}
        <p className="user-news-summary">{item.summary}</p>
        <div className="news-footer">
          <span className="user-news-date">{formatDate(item.publishedAt)}</span>
          {renderSentiment(item.sentiment)}
        </div>
      </div>
    </div>
  );
}