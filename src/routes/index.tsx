import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Armchair,
  FileText,
  HelpCircle,
  Sparkles,
  ClipboardList,
} from "lucide-react";

import { TableDrawSection } from "@/components/draw/table-draw";
import { TopicDrawSection } from "@/components/draw/topic-draw";
import { QuestionDrawSection } from "@/components/draw/question-draw";
import { ResultSummarySection } from "@/components/draw/result-summary";

import background from "@/images/background3.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hệ thống bốc thăm thi" },
      {
        name: "description",
        content:
          "Bốc bàn thi, bốc đề và bốc phiếu câu hỏi cho kỳ thi.",
      },
    ],
  }),
  component: Index,
});

const TABS = [
  {
    id: "table",
    label: "Bốc bàn thi",
    icon: Armchair,
  },
  {
    id: "topic",
    label: "Bốc đề thi chuẩn bị dự thảo nghị quyết",
    icon: FileText,
  },
  {
    id: "question",
    label: "Bốc phiếu câu hỏi",
    icon: HelpCircle,
  },
  {
    id: "result",
    label: "Kết quả bốc thăm",
    icon: ClipboardList,
  },
] as const;

function Index() {
  const [tab, setTab] =
    useState<(typeof TABS)[number]["id"]>("table");

  return (
    <div className="relative min-h-screen">

      {/* Lớp phủ trắng giúp nội dung dễ nhìn */}
      <div className="fixed inset-0 -z-10 bg-white/15" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Banner */}
        <section className="mb-6 overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={background}
            alt="Hội thi Bí thư Chi bộ năm 2026"
            className="w-full object-cover"
          />
        </section>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-4 gap-3 rounded-2xl bg-white/85 p-2 shadow-xl backdrop-blur-md">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex min-h-[64px] items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${active
                    ? "bg-red-700 text-white shadow-lg"
                    : "text-foreground/70 hover:bg-red-50"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nội dung */}
        {tab === "table" && <TableDrawSection />}
        {tab === "topic" && <TopicDrawSection />}
        {tab === "question" && <QuestionDrawSection />}
        {tab === "result" && <ResultSummarySection />}
      </main>
    </div>
  );
}