import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RotateCw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const PRIORITY_MAP: Record<number, number> = {
  1: 2,
  2: 16,
  3: 1,
  4: 7,
  5: 17,
  7: 8,
  10: 1,
  12: 9,
  13: 11,
  15: 7,
  16: 10
};

export function QuestionDrawSection() {
  const { data, isAdmin, addQuestionDraw, resetQuestionDraws } = useStore();
  const [contestantId, setContestantId] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("1");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ q: typeof data.questions[number]; name: string; rank: string } | null>(null);
  const [selectedHistoryQuestion, setSelectedHistoryQuestion] =
    useState<(typeof data.questionDraws)[number] | null>(null);

  const selectedTable = data.tableDraws.find(
    (t) => t.contestantId === contestantId
  );

  const drawnContestantIds = useMemo(
    () => new Set(data.questionDraws.map((d) => d.contestantId)),
    [data.questionDraws]
  );

  // Chỉ hiện người đã bốc bàn nhưng chưa bốc phiếu, đồng thời lọc theo bàn thi hiện tại
  const availableContestants = useMemo(() => {
    return data.contestants.filter((c) => {
      // Chưa bốc phiếu
      const notDrawn = !drawnContestantIds.has(c.id);
      if (!notDrawn) return false;

      // Tìm thông tin bốc bàn
      const tableDraw = data.tableDraws.find((t) => t.contestantId === c.id);
      if (!tableDraw) return false;

      // Lọc theo bàn (1 hoặc 2)
      return String(tableDraw.table) === tableFilter;
    });
  }, [data.contestants, data.tableDraws, drawnContestantIds, tableFilter]);

  // Lọc lịch sử bốc thăm theo bàn thi hiện tại
  const filteredHistoryDraws = useMemo(() => {
    return data.questionDraws.filter((d) => {
      const tableDraw = data.tableDraws.find((t) => t.contestantId === d.contestantId);
      return tableDraw ? String(tableDraw.table) === tableFilter : false;
    });
  }, [data.questionDraws, data.tableDraws, tableFilter]);

  const handleDraw = () => {
    if (!isAdmin) {
      toast.error("Bạn phải đăng nhập tài khoản quản trị (Admin) để thực hiện bốc thăm!");
      return;
    }
    const c = data.contestants.find(
      (x) => x.id === contestantId
    );

    if (!c) {
      toast.error("Hãy chọn người thi");
      return;
    }

    // Đã bốc phiếu
    if (drawnContestantIds.has(c.id)) {
      toast.error("Người này đã bốc phiếu");
      return;
    }

    // Chưa bốc bàn
    const tableDraw = data.tableDraws.find(
      (d) => d.contestantId === c.id
    );

    if (!tableDraw) {
      toast.error("Phải bốc bàn trước");
      return;
    }

    // Xác định bộ đề khả dụng cho thí sinh này
    let availableQuestions = data.questions;

    if (data.randomQuestion) {
      // Khi chế độ bốc câu hỏi ngẫu nhiên được bật:
      // Chỉ lọc bỏ các câu hỏi đã bốc trong cùng một bàn, không giữ chỗ ưu tiên
      availableQuestions = data.questions.filter((q) => {
        const isDrawnInThisTable = data.questionDraws.some((qd) => {
          if (qd.questionNumber !== q.number) return false;
          const td = data.tableDraws.find((t) => t.contestantId === qd.contestantId);
          return td && td.table === tableDraw.table;
        });
        return !isDrawnInThisTable;
      });
    } else {
      // Khi sử dụng logic ưu tiên mặc định:
      const priorityQuestionNum = PRIORITY_MAP[c.stt];
      if (priorityQuestionNum !== undefined) {
        const targetQ = data.questions.find((q) => q.number === priorityQuestionNum);
        if (targetQ) {
          availableQuestions = [targetQ];
        }
      } else {
        availableQuestions = data.questions.filter((q) => {
          // 1. Không trùng với đề đã bốc bởi bất kỳ ai khác trong cùng bàn thi
          const isDrawnInThisTable = data.questionDraws.some((qd) => {
            if (qd.questionNumber !== q.number) return false;
            const td = data.tableDraws.find((t) => t.contestantId === qd.contestantId);
            return td && td.table === tableDraw.table;
          });
          if (isDrawnInThisTable) return false;

          // 2. Không được bốc trùng vào đề đã được ưu tiên/để dành cho các thí sinh đặc biệt khác ở cùng bàn thi
          const isReserved = data.contestants.some((otherC) => {
            const otherPriorityNum = PRIORITY_MAP[otherC.stt];
            if (otherPriorityNum === q.number) {
              // Kiểm tra xem thí sinh ưu tiên kia đã bốc đề chưa
              const hasDrawnQ = data.questionDraws.some((qd) => qd.contestantId === otherC.id);
              if (!hasDrawnQ) {
                const otherTd = data.tableDraws.find((t) => t.contestantId === otherC.id);
                if (!otherTd) {
                  // Nếu chưa bốc bàn, thí sinh đó hoàn toàn có thể vào bàn này -> giữ chỗ ở cả hai bàn
                  return true;
                } else if (otherTd.table === tableDraw.table) {
                  // Nếu đã bốc cùng bàn -> giữ chỗ cho thí sinh đó
                  return true;
                }
              }
            }
            return false;
          });

          return !isReserved;
        });

        // Phòng hờ nếu vì lý do nào đó không còn đề nào (fallback)
        if (availableQuestions.length === 0) {
          availableQuestions = data.questions.filter((q) => {
            const isDrawnInThisTable = data.questionDraws.some((qd) => {
              if (qd.questionNumber !== q.number) return false;
              const td = data.tableDraws.find((t) => t.contestantId === qd.contestantId);
              return td && td.table === tableDraw.table;
            });
            return !isDrawnInThisTable;
          });
        }
      }
    }

    if (availableQuestions.length === 0) {
      availableQuestions = data.questions;
    }

    setSpinning(true);
    setResult(null);

    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;

      const randomQuestion =
        data.questions[
        Math.floor(
          Math.random() * data.questions.length
        )
        ];

      setResult({
        q: randomQuestion,
        name: c.name,
        rank: c.rank,
      });

      if (elapsed < 1600) {
        setTimeout(
          tick,
          70 + elapsed / 18
        );
      } else {
        const finalQuestion =
          availableQuestions[
          Math.floor(
            Math.random() * availableQuestions.length
          )
          ];

        addQuestionDraw({
          id: `qd-${Date.now()}`,
          contestantId: c.id,
          contestantName: c.name,
          rank: c.rank,
          position: c.position,
          unit: c.unit,

          questionId: finalQuestion.id,
          questionNumber: finalQuestion.number,
          questionText: finalQuestion.text,

          at: Date.now(),
        });

        setResult({
          q: finalQuestion,
          name: c.name,
          rank: c.rank,
        });

        setSpinning(false);
        setContestantId("");

        toast.success(
          `${c.rank} ${c.name} — Phiếu ${finalQuestion.number}`
        );
      }
    };

    tick();
  };

  return (
    <Card className="shadow-elegant border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><HelpCircle className="text-primary" /> Bốc phiếu câu hỏi</span>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xoá lịch sử bốc câu hỏi?")) resetQuestionDraws(); }}>
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Thí sinh lọc theo bàn thi đã bốc, sau đó chọn tên để thực hiện bốc phiếu câu hỏi tương ứng.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_420px]">          {/* Left side - Draw interface */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="rounded-md border bg-card px-3 py-1.5">
                <span className="text-muted-foreground">
                  Tổng số phiếu:
                </span>
                <span className="ml-2 font-bold text-primary">
                  {data.questions.length}
                </span>
              </div>

              <div className="rounded-md border bg-card px-3 py-1.5">
                <span className="text-muted-foreground">
                  Đã bốc:
                </span>
                <span className="ml-2 font-bold text-green-600">
                  {data.questionDraws.length}
                </span>
              </div>

              <div className="rounded-md border bg-card px-3 py-1.5">
                <span className="text-muted-foreground">
                  Chưa bốc:
                </span>
                <span className="ml-2 font-bold text-amber-600">
                  {availableContestants.length}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
              <Select value={tableFilter} onValueChange={(v) => { setTableFilter(v); setContestantId(""); }} disabled={spinning}>
                <SelectTrigger><SelectValue placeholder="Lọc theo bàn..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Bàn thi số 1</SelectItem>
                  <SelectItem value="2">Bàn thi số 2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={contestantId} onValueChange={setContestantId} disabled={spinning}>
                <SelectTrigger><SelectValue placeholder="Chọn tên người thi..." /></SelectTrigger>
                <SelectContent>
                  {availableContestants.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">Không có thí sinh khả dụng</div>}
                  {availableContestants.map((c) => {
                    const tDraw = data.tableDraws.find((t) => t.contestantId === c.id);
                    const tableText = tDraw ? ` (Bàn ${tDraw.table})` : "";
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        {c.stt}. {c.rank} {c.name}{tableText}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button size="lg" onClick={handleDraw} disabled={spinning || !contestantId} className="bg-hero text-primary-foreground shadow-elegant">
                <RotateCw className={spinning ? "animate-spin-slow" : ""} /> {spinning ? "Đang quay..." : "Bắt đầu quay"}
              </Button>
            </div>

            <div className="grid place-items-center rounded-xl border-2 border-dashed border-gold/40 bg-gradient-to-br from-secondary/40 via-accent/30 to-secondary/40 p-8 min-h-[260px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.name}
                    initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    className="text-center max-w-2xl"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-primary/70">{result.rank}</div>
                    <div className="mt-1 text-2xl font-bold">{result.name}</div>
                    <div className={`mx-auto mt-4 inline-grid h-24 w-24 place-items-center rounded-full bg-hero text-primary-foreground shadow-elegant ${spinning ? "animate-shimmer" : ""}`}>
                      <div className="text-center">
                        <div className="text-[10px] uppercase opacity-80">Phiếu số</div>
                        <div className="text-4xl font-black">{result.q.number}</div>
                      </div>
                    </div>
                    <div className="mt-4 w-full rounded-lg bg-card p-5 text-left border border-gold/30 shadow-sm">
                      <div className="text-base font-semibold mb-3 text-primary">
                        Nội dung câu hỏi:
                      </div>

                      <div
                        className="
    whitespace-pre-wrap
    text-[17px]
    leading-8
    text-foreground
    text-justify
    tracking-[0.01em]
  "
                      >  {result.q.text.split("\n").map((line, index) => {
                        // In đậm PHIẾU SỐ
                        if (/^PHIẾU SỐ\s+\d+/i.test(line.trim())) {
                          return (
                            <div key={index} className="font-bold text-2xl mb-4 text-primary">
                              {line}
                            </div>
                          );
                        }

                        // In đậm Câu 1:, Câu 2:, Câu 3:...
                        const match = line.match(/^(Câu\s+\d+:)(.*)$/i);

                        if (match) {
                          return (
                            <div key={index} className="mb-3">
                              <span className="font-extrabold text-xl text-red-700">
                                {match[1]}
                              </span>
                              <span>{match[2]}</span>
                            </div>
                          );
                        }

                        return <div key={index}>{line}</div>;
                      })}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="text-center p-4">
                    <HelpCircle className="mx-auto mb-3 h-12 w-12 text-primary/50 animate-pulse" />
                    <p className="font-bold text-base md:text-lg text-primary/90 tracking-wide">
                      Nhấn chọn tên người thi, sau đó nhấn "Bắt đầu quay"
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - History table */}
          <div className="flex flex-col rounded-lg border bg-card">
            <div className="border-b bg-secondary/50 px-3 py-2 shrink-0">
              <h4 className="text-sm font-semibold text-foreground/80">Lịch sử bốc phiếu ({filteredHistoryDraws.length})</h4>
            </div>
            <div className="max-h-[500px] overflow-auto flex-1">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                  <tr className="text-left">
                    <th className="px-2 py-2 text-[10px] font-semibold">#</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Cấp bậc</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Họ tên</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Phiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistoryDraws.length === 0 && <tr><td colSpan={4} className="px-2 py-3 text-center text-[10px] text-muted-foreground">Chưa có</td></tr>}
                  {filteredHistoryDraws.map((d, i) => {
                    const tableDraw = data.tableDraws.find((t) => t.contestantId === d.contestantId);
                    return (
                      <tr key={d.id} className="border-t hover:bg-accent/30 text-[10px]">
                        <td className="px-2 py-1.5 text-muted-foreground">{filteredHistoryDraws.length - i}</td>
                        <td className="px-2 py-1.5">{d.rank}</td>
                        <td className="px-2 py-1.5 font-medium truncate">
                          {d.contestantName}
                          {tableDraw && (
                            <span className="ml-1 text-[9px] px-1 bg-secondary text-secondary-foreground rounded">
                              T{tableDraw.table}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <Badge
                            className="bg-gold text-gold-foreground text-[9px] px-1.5 cursor-pointer hover:scale-105 transition"
                            onClick={() => setSelectedHistoryQuestion(d)}
                          >
                            Phiếu {d.questionNumber}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={!!selectedHistoryQuestion}
        onOpenChange={() =>
          setSelectedHistoryQuestion(null)
        }
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">

          <div
            className="
        whitespace-pre-wrap
        text-[17px]
        leading-8
        text-justify
      "
          >
            {selectedHistoryQuestion?.questionText
              ?.split("\n")
              .map((line, index) => {
                if (
                  /^PHIẾU SỐ\s+\d+/i.test(
                    line.trim()
                  )
                ) {
                  return (
                    <div
                      key={index}
                      className="font-bold text-2xl mb-4 text-primary"
                    >
                      {line}
                    </div>
                  );
                }

                const match = line.match(
                  /^(Câu\s+\d+:)(.*)$/i
                );

                if (match) {
                  return (
                    <div
                      key={index}
                      className="mb-3"
                    >
                      <span className="font-extrabold text-xl text-red-700">
                        {match[1]}
                      </span>
                      <span>{match[2]}</span>
                    </div>
                  );
                }

                return (
                  <div key={index}>
                    {line}
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
