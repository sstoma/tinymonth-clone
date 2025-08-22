"use client";
import React from "react";

export default function TestComponent() {
  console.log("TestComponent: Component is rendering!");
  
  return (
    <div className="bg-green-500 text-white p-4 rounded">
      <h3>Test Component Working!</h3>
      <p>If you see this, component imports are working.</p>
    </div>
  );
}
