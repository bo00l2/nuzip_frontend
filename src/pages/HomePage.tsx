import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import NewsTicker from "../components/NewsTicker";
import NewsCard from "../components/NewsCard";
import { News } from "../types/News";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import "../components/components.css";
import axios from "axios";

interface Props {
  allNews?: News[];
}

export default function HomePage({ allNews }: Props) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [newsList, setNewsList] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [newsByCategory, setNewsByCategory] = useState<Record<string, News[]>>(
    {} as Record<string, News[]>
  );

  const [loading, setLoading] = useState(true);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 전체 뉴스 불러오기
  useEffect(() => {
    axios
      .get("/api/news")
      .then((res) => {
        const news = res.data;
        setNewsList(news);
        setLoading(false);
      })
      .catch((err) => {
        console.error("전체 뉴스 불러오기 오류: ", err);
        setLoading(false);
      });
  }, []);

  const sortByDate = (list: News[]) => {
    // publishedAt이 배열이든 문자열이든 모두 처리
    const toDate = (value: News["publishedAt"]): Date => {
      if (!value) return new Date("1970-01-01");

      // 배열 형태 처리
      if (Array.isArray(value)) {
        const [year, month, day, hour = 0, min = 0] = value;
        const date = new Date(year, month - 1, day, hour, min);
        return date;
      }

      // 문자열 처리
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d;
      }
      return new Date("1970-01-01"); // 파싱 실패
    };

    const sorted = [...list].sort(
      (a, b) =>
        toDate(b.publishedAt).getTime() - toDate(a.publishedAt).getTime()
    );
    return sorted;
  };

  useEffect(() => {
    if(isSearchMode) return;
    let filtered = newsList;

    // 카테고리 필터
    if (category !== "전체") {
      filtered = newsList.filter(item => item.category === category);
    }

    setFilteredNews(sortByDate(filtered));
    setCurrentPage(1);
  }, [newsList, newsByCategory, category]);


  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  // const indexOfLast = currentPage * itemsPerPage;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  // 페이지 이동 함수
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 검색 실행 (버튼 클릭 or 엔터)
  const handleSearch = () => {
    if (!keyword.trim()) {
      setIsSearchMode(false);
      setFilteredNews(newsList);
      setCurrentPage(1);
      return;
    }

    const filtered = newsList.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.summary.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredNews(sortByDate(filtered));
    setIsSearchMode(true);
    setCurrentPage(1);
  };

  const handleTabSelect = (category: string) => {
    setCategory(category);
    setIsSearchMode(false);
    setCurrentPage(1);

    if (category === "전체") {
      setFilteredNews(newsList);
    } else {
      const filtered = newsList.filter((item) => item.category === category);
      setFilteredNews(sortByDate(filtered));
    }
  };

  // 검색어 지웠을 때 자동 복구
  useEffect(() => {
    if (!keyword.trim()) {
      setIsSearchMode(false);
      setFilteredNews(newsList);
      setCurrentPage(1);
    }
  }, [keyword, newsList]);


  const tickerSource = (allNews && allNews.length > 0) ? allNews : newsList;


  return (
    <div className="home-container" style={{ padding: "0" }}>
      {/* 헤더 */}
      <div className="home-header">
        <img
          src="src/pages/Nuzip_logo2.png"
          alt="logo"
          className="home-logo"
          onClick={() => navigate("/")}
        />
        <SearchBar
          keyword={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
        />
        <div className="header-buttons">

        <button className="login" onClick={() => navigate("/login")}>
          로그인
        </button>
        <button className="signup" onClick={() => navigate("/signup")}>
          회원가입
        </button>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="category-wrapper">
        <CategoryTabs selected={category} onSelect={handleTabSelect} />
      </div>

      <div>
        <NewsTicker newsList={tickerSource} />
      </div>

      {/* 뉴스 리스트 */}
      <div style={{ marginTop: "20px" }}>
        {isSearchMode && <h2 style={{ marginBottom: "10px" }}>검색 결과</h2>}
        <hr style={{ width: "1000px" }} />

        {currentNews.length > 0 ? (
          <div
            className="news-list-wrapper"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            {currentNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p style={{ marginTop: "10px" }}>
            {isSearchMode
              ? "검색 결과가 없습니다."
              : "해당 카테고리의 기사가 없습니다."}
          </p>
        )}

        {/* 페이지네이션 */}
        <div className="pagination" style={{ marginTop: "10px" }}>
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>

          <span>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
