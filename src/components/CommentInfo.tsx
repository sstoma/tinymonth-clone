import React from "react";

export default function CommentInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <p className="font-medium mb-1">How to add a comment to a day:</p>
          <ul className="text-xs space-y-1">
            <li>• <strong>Ctrl+click</strong> (or Cmd+click on Mac) on a day opens the comment editor</li>
            <li>• <strong>Yellow dot</strong> in the top right corner means the day has a comment</li>
            <li>• <strong>Hovering over</strong> a day shows a tooltip with the comment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
