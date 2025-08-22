"use client";
import { useCallback } from "react";

const TAGS_KEY = "tinymonth_tags";
type TagsMap = Record<string, string>;

function getTagsFromStorage(): TagsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTagsToStorage(tags: TagsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export default function useTaggedDays() {
  const getTag = useCallback((date: string) => {
    const tags = getTagsFromStorage();
    return tags[date] || "";
  }, []);

  const setTag = useCallback((date: string, tag: string) => {
    const tags = getTagsFromStorage();
    tags[date] = tag;
    saveTagsToStorage(tags);
  }, []);

  return { getTag, setTag };
}