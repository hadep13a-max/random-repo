import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RotateCw, Trash2, Sparkles } from "lucide-react";
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

const ConfettiParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      scale: Math.random() * 0.8 + 0.4,
      color: i % 4 === 0 ? "#EAB308" : i % 4 === 1 ? "#EF4444" : i % 4 === 2 ? "#3B82F6" : "#ffffff",
      delay: Math.random() * 0.3,
    })),
    []
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: [0, p.scale, 0],
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: [0.1, 0.8, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
};


const PRIORITY_MAP: Record<number, number> = {
  1: 2,
  2: 16,
  3: 1,
  4: 7,
  5: 17,
  7: 8,
  8: 14,
  9: 13,
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
  const [result, setResult] = useState<{ q: typeof data.questions[number]; name: string; rank: string; table: string } | null>(null);
  const [selectedHistoryQuestion, setSelectedHistoryQuestion] =
    useState<(typeof data.questionDraws)[number] | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

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

    const tableNum = String(tableDraw.table);

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
        table: tableNum,
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
          table: tableNum,
        });

        setSpinning(false);
        setContestantId("");
        setShowResultModal(true);
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
    text-[18px]
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
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-gold/30 shadow-[0_0_50px_rgba(234,179,8,0.25)] rounded-2xl p-6">
          <AnimatePresence>
            {showResultModal && result && (
              <div className="relative">
                <ConfettiParticles />

                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="space-y-5 text-center animate-in fade-in zoom-in duration-300"
                >
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-sm">
                      KẾT QUẢ BỐC PHIẾU CÂU HỎI
                    </h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                      PHẦN THI NHẬN THỨC
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-sm text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block text-[10px] md:text-xs px-2.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-yellow-400 font-bold uppercase tracking-wider">
                          BÀN THI SỐ {result.table}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          {result.rank}
                        </span>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-slate-100 tracking-wide mt-0.5 block">
                        {result.name}
                      </span>
                    </div>
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-1.5 rounded-lg border border-yellow-300/20 font-extrabold text-sm md:text-base whitespace-nowrap shadow-sm">
                      PHIẾU SỐ {result.q.number}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-gold/20 rounded-xl p-5 text-justify text-slate-200 shadow-inner">
                    <div className="font-semibold text-gold mb-2 text-xs uppercase tracking-wider text-center border-b border-white/5 pb-1 w-32 mx-auto">
                      Nội dung câu hỏi
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-[25px] md:text-[28px] font-bold leading-relaxed text-slate-100 tracking-[0.01em]">
                      {result.q.text.split("\n").map((line, index) => {
                        // Bỏ dòng tiêu đề PHIẾU SỐ trùng lặp
                        if (/^PHIẾU SỐ\s+\d+/i.test(line.trim())) {
                          return null;
                        }

                        // In đậm Câu 1:, Câu 2:, Câu 3:...
                        const match = line.match(/^(Câu\s+\d+:)(.*)$/i);

                        if (match) {
                          return (
                            <div key={index} className="mb-4">
                              <span className="font-black text-2xl md:text-3xl text-red-400 mr-2.5 block sm:inline">
                                {match[1]}
                              </span>
                              <span>{match[2]}</span>
                            </div>
                          );
                        }

                        return <div key={index} className="mb-3">{line}</div>;
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      size="lg"
                      onClick={() => setShowResultModal(false)}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold px-12 py-3 rounded-xl border border-red-500/20 shadow-lg hover:shadow-red-900/30 transition-all cursor-pointer"
                    >
                      ĐỒNG Ý & ĐÓNG
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
