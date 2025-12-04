import React, { useState, useEffect, useRef } from "react";
import "./NewsTicker.css";
import { News } from "../types/News";

interface NewsTickerProps {
  newsList: News[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsList }) => {
  const [queue, setQueue] = useState(newsList);
  const [translate, setTranslate] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const tickerItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQueue(newsList);
  }, [newsList]);

  useEffect(() => {
    if (!tickerItemRef.current || expanded) {
      return;
    }

    const itemHeight = tickerItemRef.current.offsetHeight;
    console.log("아이템 높이:", itemHeight);

    const interval = setInterval(() => {
      setTranslate(-itemHeight);

      setTimeout(() => {
        setQueue((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });

        setTranslate(0);
      }, 500); // transition 시간과 동일해야 함
    }, 3000);

    return () => clearInterval(interval);
  }, [newsList]);

  return (
    <div
      style={{
        border: "1px solid darkgrey",
        borderRadius: "8px",
        width: "600px",
        position: "relative",
        marginTop: "15px",
      }}
    >
      {/* 상단 1줄 티커 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="ticker-viewport">
          <div
            className="ticker-list"
            style={{
              display: "flex",
              flexDirection: "column",
              transform: `translateY(${translate}px)`,
              transition: expanded
                ? "none"
                : translate === 0
                ? "none"
                : "transform 0.5s ease-out",
            }}
          >
            {queue.map((item, i) => (
              <a
                key={i}
                href={item.originalLink}
                target="_blank"
                rel="noopener noreferrer"
                ref={i === 0 ? tickerItemRef : null}
                className="ticker-item"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>

        {/* 🔽 펼치기 / 접기 버튼 */}
        <button onClick={() => setExpanded(!expanded)} className="ticker-btn">
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* 🔥 아래로 펼쳐지는 목록 */}
      {expanded && (
        <div className="ticker-expanded-list">
          {newsList.map((item, i) => (
            <a
              key={i}
              href={item.originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ticker-expanded-item"
            >
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsTicker;
