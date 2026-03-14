import * as React from "react";
import { Tag, X } from "lucide-react";

interface TaskTagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  /** Hide the Tag icon on the left (used in detail sheet edit) */
  hideIcon?: boolean;
}

export function TaskTagsInput({ tags, onTagsChange, hideIcon = false }: TaskTagsInputProps) {
  const [tagInput, setTagInput] = React.useState("");

  const addTag = (raw: string) => {
    const newTag = raw.trim().replace(/,$/, "");
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setTagInput("");
  };

  return (
    <>
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onTagsChange(tags.filter((_, idx) => idx !== i))}
                className="hover:text-indigo-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        {!hideIcon && <Tag className="h-4 w-4 text-muted-foreground/60 shrink-0" />}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
              e.preventDefault();
              addTag(tagInput);
            }
          }}
          onBlur={() => addTag(tagInput)}
          placeholder="Add tags (press Enter or comma)"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
        />
      </div>
    </>
  );
}
