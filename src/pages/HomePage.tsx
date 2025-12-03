import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import NewsCard from "../components/NewsCard";
import { News } from "../types/News";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import "../components/components.css";
import axios from "axios";

export default function HomePage() {
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

  // 전체 뉴스 불러오기
  useEffect(() => {
    axios
      .get("/api/news")
      .then((res) => {
        const news = res.data;
        setNewsList(news);

        // 🔹 카테고리별 뉴스 맵 생성
        const categoryMap: Record<string, News[]> = {};
        news.forEach((item: News) => {
          const cat = item.category || "기타"; // 카테고리가 없으면 "기타"로 분류
          if (!categoryMap[cat]) categoryMap[cat] = [];
          categoryMap[cat].push(item);
        });
        setNewsByCategory(categoryMap);

        setLoading(false);
      })
      .catch((err) => {
        console.error("전체 뉴스 불러오기 오류: ", err);
        setLoading(false);
      });
  }, []);

  // 날짜 기준 정렬
  const sortByDate = (list: News[]) => {
    return [...list].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  };

  useEffect(() => {
    let filtered = newsList;

    // 🔹 카테고리 필터
    if (category !== "전체") {
      filtered = newsByCategory[category] || [];
    }

    // 🔹 검색어 필터
    if (keyword.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.summary.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    setFilteredNews(sortByDate(filtered));
  }, [newsList, newsByCategory, category, keyword]);

  // 검색 실행 (버튼 클릭 or 엔터)
  const handleSearch = () => {};

  const handleTabSelect = (cat: string) => {
    setCategory(cat);
  };

  // 검색어 지웠을 때 자동 복구
  useEffect(() => {
    if (!keyword.trim()) {
      setIsSearchMode(false);
      setFilteredNews(newsList);
    }
  }, [keyword, newsList]);

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
        <button className="login" onClick={() => navigate("/login")}>
          로그인
        </button>
        <button className="signup" onClick={() => navigate("/signup")}>
          회원가입
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="category-wrapper">
        <CategoryTabs selected={category} onSelect={handleTabSelect} />
      </div>

      {/* 뉴스 카드 */}
      {isSearchMode ? (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>검색 결과</h2>
          <hr />
          {filteredNews.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p style={{ marginTop: "10px" }}>검색 결과가 없습니다.</p>
          )}
        </div>
      ) : (
        <div
          className="news-list-wrapper"
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {newsList.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
