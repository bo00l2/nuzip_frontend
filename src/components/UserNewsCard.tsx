import { News } from "../types/News";
import "./UserNewsCard.css"

interface Props {
  item: News;
}


export default function UserNewsCard({item}: Props) {
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

  return (
    <div className="user-news-card">
      <img src={item.imageUrl} alt={item.title} className="user-news-thumbnail" />
      <div className="user-news-content">
        <a 
          href={item.originalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="news-title-link"
          >
          <h2 className="news-title">{item.title}</h2>
        </a>
        <p className="user-news-summary">{item.summary}</p>
        <span className="user-news-date">{formatDate(item.publishedAt)}</span>
      </div>
    </div>
  )
}