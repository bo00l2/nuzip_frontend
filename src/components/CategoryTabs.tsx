import './components.css'

const categories = [
  "전체",
  "정치",
  "경제",
  "사회",
  "생활ㆍ문화",
  "ITㆍ과학",
  "세계",
  "엔터",
  "스포츠",
];

interface Props {
  selected: string;
  onSelect: (c: string) => void;
}

export default function CategoryTabs({ selected, onSelect }: Props) {
  return (
    <div className="category-tabs">
      {categories.map((c) => (
        <div
          key={c}
          onClick={() => onSelect(c)}
          className={`category-item ${
            selected === c
              ? "active"
              : ""
          }`}
        >
          {c}
        </div>
      ))}
    </div>
  );
}
