import { News } from "../types/News";
import { useEffect, useState } from "react";
import axios from "axios";
import "../components/components.css"
import NewsCard from "../components/UserNewsCard";
import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import { useNavigate } from "react-router-dom";

import "./UserHome.css";

export default function UserHome() {
  const navigate = useNavigate();

  const [userCategory, setUserCategory] = useState<string[]>([
    "정치",
    "경제",
    "ITㆍ과학",
  ]);

  const [newsByCategory, setNewsByCategory] = useState<Record<string, News[]>>(
    {} as Record<string, News[]>
  );

  const [newsList, setNewsList] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);

  const [loading, setLoading] = useState(true);

  // 검색 관련 상태
  const [keyword, setKeyword] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Record<string, News[]>>(
    {} as Record<string, News[]>
  );

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("전체");

  const itemsPerPage = 5;
  const [pageByCategory, setPageByCategory] = useState<Record<string, number>>(
    {} as Record<string, number>
  );
  const [currentPage, setCurrentPage] = useState(1);

  const setCategoryPage = (category: string, page: number) => {
    setPageByCategory((prev) => ({ ...prev, [category]: page }));
  };

  const sortByDate = (list: News[]) => {
    // 📌 publishedAt이 배열이든 문자열이든 모두 처리
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

  // 회원 카테고리 불러오기
  useEffect(() => {
    axios
      .get("/api/users/me/categories")
      .then((res) => setUserCategory(res.data))
      .catch((err) => console.error("카테고리 불러오기 오류:", err));
  }, []);

  // 전체 뉴스 불러오기
  useEffect(() => {
    axios
      .get("/api/news")
      .then((res) => {
        setNewsList(res.data);
        setFilteredNews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("전체 뉴스 불러오기 오류: ", err);
        setLoading(false);
      });
  }, []);

  // 카테고리별 기사 불러오기
  useEffect(() => {
    if (userCategory.length === 0) return;

    const fetchAll = async () => {
      const result: Record<string, News[]> = {};
      const pageInit: Record<string, number> = {};

      for (const c of userCategory) {
        try {
          const res = await axios.get(
            `/api/news/category/${encodeURIComponent(c)}?page=0&size=10`
          );

          result[c] = sortByDate(res.data);
          pageInit[c] = 1;
        } catch (err) {
          console.error(`${c} 뉴스 불러오기 오류:`, err);
          result[c] = [];
          pageInit[c] = 1;
        }
      }
      setNewsByCategory(result);
      setSearchResult(result); // 초기 검색 결과는 전체 뉴스
      setLoading(false);
    };

    fetchAll();
  }, [userCategory]);

  // 검색 버튼 클릭 시 실행
  const handleSearch = () => {
    if (!keyword.trim()) {
      setSearchResult(newsByCategory);
      setIsSearchMode(false); // 검색어 없으면 전체
      setCurrentPage(1);
      return;
    }

    const filtered: Record<string, News[]> = {};
    for (const category of userCategory) {
      filtered[category] =
        newsByCategory[category]?.filter(
          (item) =>
            item.title.includes(keyword) || item.summary.includes(keyword)
        ) || [];

      filtered[category] = sortByDate(filtered[category]);
    }
    setSearchResult(filtered);
    setIsSearchMode(true);
    setSelectedTab("전체");
    setCurrentPage(1);
  };

  // 검색어를 지웠을 때 자동으로 기사 복구
  useEffect(() => {
    if (!keyword.trim()) {
      setIsSearchMode(false);
      setSearchResult(newsByCategory);
      setCurrentPage(1);
    }
  }, [keyword, newsByCategory]);

  const handleTabSelect = (category: string) => {
    setSelectedTab(category);
    setIsSearchMode(false);
    setCurrentPage(1);

    if (category === "전체") {
      setFilteredNews(newsList);
    } else {
      const filtered = newsList.filter((item) => item.category === category);
      setFilteredNews(sortByDate(filtered));
    }
  };

  if (loading) return <div>로딩 중...</div>;

  // 페이지네이션 계산
  const list = isSearchMode
    ? Object.values(searchResult).flat()
    : selectedTab === "전체"
    ? Object.values(newsByCategory).flat()
    : filteredNews;

  const totalPages =
    selectedTab !== "전체" && !isSearchMode
      ? 1
      : Math.ceil(list.length / itemsPerPage);


  return (
    <div className="user-home-container" style={{ padding: "0" }}>
      <div className="user-header">
        <img
          src="src/pages/Nuzip_logo2.png"
          alt="logo"
          className="header-logo"
          onClick={() => navigate("/user")}
        />

        {/* 검색창 */}
        <SearchBar
          keyword={keyword}
          onChange={setKeyword}
          onSearch={handleSearch}
        />
        <button className="logout" onClick={() => navigate("/page")}>
          Logout
        </button>
        <button className="mypage" onClick={() => navigate("/mypage")}>
          마이페이지
        </button>
      </div>

      {/* 카테고리 탭 */}
      <CategoryTabs selected={selectedTab} onSelect={handleTabSelect} />

      {/* 검색 결과 전용 UI */}
      {isSearchMode ? (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>검색 결과</h2>
          <hr />

          {/* 전체 검색 결과 */}
          {Object.values(searchResult).flat().length > 0 ? (
            <div className="all-news">
              {Object.values(searchResult)
                .flat()
                .map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
            </div>
          ) : (
            <p style={{ marginTop: "10px" }}>검색 결과가 없습니다.</p>
          )}
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                이전
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          )}
        </div>
      ) : selectedTab !== "전체" ? (
        /* 단일 카테고리 모드 */
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "10px" }}>{selectedTab} 뉴스</h2>
          <hr style={{width: "1000px"}} />

          {filteredNews.length > 0 ? (
            <div className="all-news">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p style={{ marginTop: "10px" }}>
              해당 카테고리의 기사가 없습니다.
            </p>
          )}
        </div>
      ) : (
        // 전체 모드 (3컬럼 카테고리별 페이지네이션)
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {userCategory.map((category) => {
            const currentPage = pageByCategory[category] || 1;
            const total = Math.ceil(
              (newsByCategory[category]?.length || 0) / itemsPerPage
            );

            const paginated = newsByCategory[category]?.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            );

            return (
              <div key={category} style={{ flex: 1 }}>
                <h2 style={{ marginBottom: "10px" }}>{category}</h2>
                <hr />

                {paginated && paginated.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {paginated.map((item) => (
                      <NewsCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <p>해당 카테고리의 기사가 없습니다.</p>
                )}

                {/* ⭐ 카테고리별 페이지네이션 UI */}
                {total > 1 && (
                  <div className="pagination" style={{ marginTop: "10px" }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCategoryPage(category, currentPage - 1)}
                    >
                      이전
                    </button>
                    <span>
                      {currentPage} / {total}
                    </span>
                    <button
                      disabled={currentPage === total}
                      onClick={() => setCategoryPage(category, currentPage + 1)}
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
