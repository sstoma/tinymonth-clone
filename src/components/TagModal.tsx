"use client";
import React from "react";
import useTaggedDays from "./useTaggedDays";

const TAG_COLORS = [
  { name: "blue", color: "bg-blue-500" },
  { name: "red", color: "bg-red-500" },
  { name: "green", color: "bg-green-500" },
  { name: "yellow", color: "bg-yellow-400" },
  { name: "purple", color: "bg-purple-500" },
];

type TagModalProps = {
  date: string;
  onClose: () => void;
};

export default function TagModal({ date, onClose }: TagModalProps) {
  const { getTag, setTag } = useTaggedDays();
  const currentTag = getTag(date);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-4 rounded shadow w-72">
        <h2 className="text-lg font-bold mb-3">Tag for {date}</h2>
        <div className="flex gap-2 mb-4">
          {TAG_COLORS.map(tag => (
            <button
              key={tag.name}
              className={`w-8 h-8 rounded-full border-2 ${tag.color} ${currentTag === tag.name ? "border-black" : "border-transparent"}`}
              onClick={() => { setTag(date, tag.name); onClose(); }}
            />
          ))}
        </div>
        <button className="px-3 py-1 bg-gray-200 rounded w-full" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}