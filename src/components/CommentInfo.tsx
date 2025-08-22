import React from "react";

export default function CommentInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
        <div>
          <p className="font-medium mb-1">Jak dodać komentarz do dnia:</p>
          <ul className="text-xs space-y-1">
            <li>• <strong>Ctrl+klik</strong> (lub Cmd+klik na Mac) na dzień otwiera edytor komentarza</li>
            <li>• <strong>Żółta kropka</strong> w prawym górnym rogu oznacza, że dzień ma komentarz</li>
            <li>• <strong>Najechanie myszką</strong> na dzień pokazuje tooltip z komentarzem</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
