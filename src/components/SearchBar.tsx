interface Props {
  keyword: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

import './components.css'

export default function SearchBar({ keyword, onChange, onSearch }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() === "") return;
    onSearch();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
        placeholder="검색어를 입력하세요"
        className="search-input"
      />
      <button
        type="submit" className="search-button"
      >
        검색
      </button>
      </form>
    </div>
  );
}
