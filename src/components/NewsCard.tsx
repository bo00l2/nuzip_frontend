import { News } from "../types/News";
import "./components.css";

interface Props {
  item: News;
}

const FAILURE_INDICATORS = [
  "기사 없음",
  "내용 부족",
  "분석 불가",
  "정보 없음",
  "데이터 없음",
  "제공된 기사",
  "요약 불가",
  "분석 실패",
  "기사 내용",
  "이 기사는",
  "이 내용은",
  "제공된 텍스트",
  "기사 본문",
  "제공된 내용은",
  "#오류",
];

const LOWERCASE_FAILURE_INDICATORS = FAILURE_INDICATORS.map((ind) =>
  // 모든 공백, 'ㆍ'(한글 십자 형태 하이픈), '.', '[', ']', '#'를 제거합니다.
  ind
    .toLowerCase()
    .trim()
    .replace(/\s/g, "")
    .replace(/ㆍ/g, "")
    .replace(/\./g, "")
    .replace(/#/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
);

/**
 * 텍스트를 분석 실패 지표와 비교하기 위해 정규화하는 헬퍼 함수
 * (소문자, 모든 공백, 'ㆍ', '.', '[', ']', '#' 제거)
 */
const normalizeText = (text) => {
  if (typeof text !== "string") return "";
  // 모든 공백, 'ㆍ'(한글 십자 형태 하이픈), '.', '[', ']', '#'를 제거합니다.
  return text
    .toLowerCase()
    .trim()
    .replace(/\s/g, "")
    .replace(/ㆍ/g, "")
    .replace(/\./g, "")
    .replace(/#/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "");
};

/**
 * 분석 성공 여부를 판단하는 핵심 필터링 로직
 */
const isAnalysisSuccessful = (newsItem) => {
  const summary = newsItem.summary;
  const keywords = newsItem.keywords;

  // 1. 요약 내용이 없거나 유효하지 않으면 숨김 (분석 실패)
  if (!summary || typeof summary !== "string" || summary.trim().length < 5) {
    return false;
  }

  const normalizedSummary = normalizeText(summary);
  const normalizedKeywords = normalizeText(keywords);

  // 2. 요약에 명시적인 분석 실패 지표가 포함된 경우 숨김
  if (
    LOWERCASE_FAILURE_INDICATORS.some((ind) => normalizedSummary.includes(ind))
  ) {
    return false;
  }

  // 3. 키워드 필드 자체에 명시적인 실패 지표가 포함된 경우 숨김
  if (
    normalizedKeywords.length > 0 &&
    LOWERCASE_FAILURE_INDICATORS.some((ind) => normalizedKeywords.includes(ind))
  ) {
    return false;
  }

  return true;
};



// 🔹 날짜 포맷 함수 추가
// formatDateTime 함수 내부 수정 (보강된 버전)
const formatDateTime = (raw: any): string => {
  if (!raw) return "날짜 정보 없음";

  const pad = (n: number) => n.toString().padStart(2, "0");

  let date: Date | null = null;

  // 🔹 1) 배열 형태 [YYYY,MM,DD,hh,mm] 처리
  if (Array.isArray(raw)) {
    const [y, mo, d, h = 0, mi = 0] = raw;

    // 배열 유효성 검사
    if (!y || !mo || !d) return "날짜 정보 없음";

    date = new Date(y, mo - 1, d, h, mi);
  }

  // 🔹 2) 숫자(timestamp) 처리
  else if (typeof raw === "number") {
    date = new Date(raw);
  }

  // 🔹 3) 문자열 처리
  else if (typeof raw === "string") {
    let s = raw.trim();

    s = s.replace(/\./g, "-").replace(/\//g, "-").replace(" ", "T");

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      s = s + "T00:00:00";
    }

    date = new Date(s);
  }

  // date 생성 실패
  if (!date || isNaN(date.getTime())) {
    console.error("❌ 날짜 파싱 실패:", raw);
    return "날짜 정보 없음";
  }

  // 🔹 KST 보정
  const kst = new Date(date.getTime() + 9 * 3600 * 1000);

  return (
    `${kst.getFullYear()}.` +
    `${pad(kst.getMonth() + 1)}.` +
    `${pad(kst.getDate())} ` +
    `${pad(kst.getHours())}:` +
    `${pad(kst.getMinutes())}:` +
    `${pad(kst.getSeconds())}`
  );
};



export default function NewsCard({ item }: Props) {
  // 실패 기사 숨기기
  if (!isAnalysisSuccessful(item)) {
    return null;
  }

  /**
   * 키워드 파싱 함수
   */
  const parseKeywords = (keywordString: string | undefined): string[] => {
    if (!keywordString) return [];

    return keywordString
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    // 3. 중복 제거
    // return [...new Set(parts)];/
  };

  const keywords = parseKeywords(item.keywords);

  return (
    <div className="news-card">
      {item.imageUrl && (
        <img
          src={item.imageUrl || "src/pages/Nuzip_logo.png"}
          alt={item.title}
          className="news-thumbnail"
        />
      )}

      <div className="news-content">
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
        <p className="news-summary">{item.summary}</p>

        <span className="news-date">{formatDateTime(item.publishedAt)}</span>
      </div>
    </div>
  );
}
