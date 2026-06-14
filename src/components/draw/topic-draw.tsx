import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RotateCw, Trash2, Info, Eye, EyeOff, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { TOPICS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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


export function TopicDrawSection() {
  const { data, isAdmin, addTopicDraw, resetTopicDraws } = useStore();
  const [contestantId, setContestantId] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ idx: number; name: string; rank: string; group: 1 | 2 } | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<1 | 2>(1);
  const [showResultModal, setShowResultModal] = useState(false);

  const drawnIds = useMemo(
    () => new Set(data.topicDraws.map((d) => d.contestantId)),
    [data.topicDraws]
  );

  const available = useMemo(
    () =>
      data.contestants.filter(
        (c) =>
          (c.stt === 1 || c.stt === 21) &&
          !drawnIds.has(c.id)
      ),
    [data.contestants, drawnIds]
  );

  const rep1 = useMemo(() => data.contestants.find((c) => c.stt === 1), [data.contestants]);
  const rep2 = useMemo(() => data.contestants.find((c) => c.stt === 21), [data.contestants]);

  const group1Drawn = useMemo(
    () => (rep1 ? drawnIds.has(rep1.id) : false),
    [rep1, drawnIds]
  );
  const group2Drawn = useMemo(
    () => (rep2 ? drawnIds.has(rep2.id) : false),
    [rep2, drawnIds]
  );

  const filteredAvailable = useMemo(() => {
    return available.filter((c) =>
      selectedTarget === 1 ? c.stt === 1 : c.stt === 21
    );
  }, [available, selectedTarget]);

  // Set default selectedTarget based on who hasn't drawn yet
  useEffect(() => {
    if (group1Drawn && !group2Drawn) {
      setSelectedTarget(2);
    } else if (group2Drawn && !group1Drawn) {
      setSelectedTarget(1);
    }
  }, [group1Drawn, group2Drawn]);

  // Auto-select the contestant representing the selected target
  useEffect(() => {
    const candidate = available.find(
      (c) => (selectedTarget === 1 ? c.stt === 1 : c.stt === 21)
    );
    if (candidate) {
      setContestantId(candidate.id);
    } else {
      setContestantId("");
    }
  }, [selectedTarget, available]);

  const visibleTopics = useMemo(() => {
    if (selectedTarget === 2) {
      return [
        { index: 0, text: TOPICS[0] },
        { index: 2, text: TOPICS[2] },
      ];
    }
    return TOPICS.map((text, index) => ({ index, text }));
  }, [selectedTarget]);
  const handleDraw = () => {
    if (!isAdmin) {
      toast.error("Bạn phải đăng nhập tài khoản quản trị (Admin) để thực hiện bốc thăm!");
      return;
    }
    const c = data.contestants.find((x) => x.id === contestantId);

    if (!c) {
      toast.error("Hãy chọn người thi");
      return;
    }

    if (drawnIds.has(c.id)) {
      toast.error("Nhóm này đã bốc đề rồi");
      return;
    }

    const pool = c.group === 1 ? [0, 1, 2] : [0, 2];

    setSpinning(true);
    setResult(null);

    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;

      const pick = pool[Math.floor(Math.random() * pool.length)];

      setResult({
        idx: pick,
        name: c.name,
        rank: c.rank,
        group: c.group as 1 | 2,
      });

      if (elapsed < 1400) {
        setTimeout(tick, 80 + elapsed / 18);
      } else {
        const finalPick = data.randomTopic
          ? pool[Math.floor(Math.random() * pool.length)]
          : 0;

        // Xác định nhóm được gán đề
        const relatedContestants =
          c.stt === 1
            ? data.contestants.filter(
              (x) => x.stt >= 1 && x.stt <= 20
            )
            : data.contestants.filter(
              (x) => x.stt >= 21 && x.stt <= 24
            );

        // Gán đề cho toàn bộ nhóm
        relatedContestants.forEach((person) => {
          addTopicDraw({
            id: `to-${person.id}-${Date.now()}-${Math.random()}`,
            contestantId: person.id,
            contestantName: person.name,
            rank: person.rank,
            position: person.position,
            unit: person.unit,
            group: person.group,
            topicIndex: finalPick,
            topicText: TOPICS[finalPick],
            at: Date.now(),
          });
        });

        setResult({
          idx: finalPick,
          name: c.name,
          rank: c.rank,
          group: c.group as 1 | 2,
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
          <span className="flex items-center gap-2"><FileText className="text-primary" /> Bốc đề thi chuẩn bị dự thảo nghị quyết</span>
          
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xoá lịch sử bốc đề?")) resetTopicDraws(); }}>
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Thí sinh đại diện của từng nhóm thực hiện bốc thăm đề bài chuẩn bị dự thảo nghị quyết chung.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1fr_500px]">
          {/* Left side - Topics & Draw interface */}
          <div className="space-y-3">
            {showTopics && (
              <div className="rounded-lg border bg-secondary/30 p-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold"><Info className="h-3 w-3 text-primary" /> Danh sách đề thi</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowTopics(false)}
                    className="h-5 w-5 p-0"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <ol className="space-y-2 text-xs">
                  {visibleTopics.map(({ index, text }) => (
                    <li key={index} className="flex gap-2 items-start">
                      <Badge className="bg-gold text-gold-foreground shrink-0">Đề {index + 1}</Badge>
                      <span className="text-foreground/80 leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {!showTopics && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTopics(true)}
                className="w-full"
              >
                <Eye className="h-3.5 w-3.5 mr-2" /> Hiển thị danh sách đề
              </Button>
            )}

            <div className="grid gap-3">
              {/* Ô chọn Đối tượng 1 & Đối tượng 2 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => setSelectedTarget(1)}
                  className={`group relative overflow-hidden flex flex-col p-3.5 rounded-xl border text-left transition-all duration-300 ${
                    selectedTarget === 1
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/30 bg-card hover:bg-secondary/20"
                  } ${spinning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {selectedTarget === 1 && (
                    <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-primary/10 blur-md pointer-events-none" />
                  )}
                  <div className="flex justify-between items-start w-full gap-2">
                    <span className={`font-bold text-xs tracking-wide ${selectedTarget === 1 ? "text-primary font-extrabold" : "text-foreground/80"}`}>
                      Đối tượng 1
                    </span>
                    <div className={`w-2 h-2 rounded-full transition-transform duration-300 ${selectedTarget === 1 ? "bg-primary scale-125 animate-pulse" : "bg-muted-foreground/30"}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 leading-tight font-medium">
                    Bốc 1 trong 3 đề (Đề 1, 2, 3)
                  </span>
                  
                  {rep1 && (
                    <div className="mt-2 text-[10px] text-foreground/70 border-t pt-1.5 border-border/40 font-medium">
                      Đại diện: <span className="text-foreground font-semibold">{rep1.rank} {rep1.name}</span>
                    </div>
                  )}

                  <div className="mt-2">
                    {group1Drawn ? (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                        Đã bốc đề
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] px-1.5 py-0 font-normal bg-emerald-600 hover:bg-emerald-600/90 text-white border-transparent">
                        Chưa bốc
                      </Badge>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => setSelectedTarget(2)}
                  className={`group relative overflow-hidden flex flex-col p-3.5 rounded-xl border text-left transition-all duration-300 ${
                    selectedTarget === 2
                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/30 bg-card hover:bg-secondary/20"
                  } ${spinning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {selectedTarget === 2 && (
                    <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-primary/10 blur-md pointer-events-none" />
                  )}
                  <div className="flex justify-between items-start w-full gap-2">
                    <span className={`font-bold text-xs tracking-wide ${selectedTarget === 2 ? "text-primary font-extrabold" : "text-foreground/80"}`}>
                      Đối tượng 2
                    </span>
                    <div className={`w-2 h-2 rounded-full transition-transform duration-300 ${selectedTarget === 2 ? "bg-primary scale-125 animate-pulse" : "bg-muted-foreground/30"}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 leading-tight font-medium">
                    Bốc 1 trong 2 đề (Đề 1, 3)
                  </span>
                  
                  {rep2 && (
                    <div className="mt-2 text-[10px] text-foreground/70 border-t pt-1.5 border-border/40 font-medium">
                      Đại diện: <span className="text-foreground font-semibold">{rep2.rank} {rep2.name}</span>
                    </div>
                  )}

                  <div className="mt-2">
                    {group2Drawn ? (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                        Đã bốc đề
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] px-1.5 py-0 font-normal bg-emerald-600 hover:bg-emerald-600/90 text-white border-transparent">
                        Chưa bốc
                      </Badge>
                    )}
                  </div>
                </button>
              </div>

              <Select value={contestantId} onValueChange={setContestantId} disabled={spinning}>
                <SelectTrigger><SelectValue placeholder="Chọn người thi..." /></SelectTrigger>
                <SelectContent>
                  {filteredAvailable.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Đại diện nhóm đã bốc đề
                    </div>
                  )}

                  {filteredAvailable.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.stt === 1
                        ? `${c.rank} ${c.name} (Đại diện nhóm đối tượng 1)`
                        : `${c.rank} ${c.name} (Đại diện nhóm đối tượng 2)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="lg" onClick={handleDraw} disabled={spinning || !contestantId} className="bg-hero text-primary-foreground shadow-elegant w-full">
                <RotateCw className={spinning ? "animate-spin-slow" : ""} /> {spinning ? "Đang bốc..." : "Bốc đề"}
              </Button>
            </div>

            <div className="grid place-items-center rounded-xl border border-dashed border-primary/30 bg-gradient-to-br from-secondary/40 to-accent/40 p-4 min-h-[200px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.name}
                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="text-center max-w-2xl"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-primary/70">{result.rank}</div>
                    <div className="mt-1 text-2xl font-bold">{result.name}</div>
                    <div className="mt-4 inline-block bg-hero rounded-xl px-8 py-3 text-primary-foreground shadow-elegant">
                      <div className="text-[10px] uppercase opacity-80">Đề thi số</div>
                      <div className="text-4xl font-black">{result.idx + 1}</div>
                    </div>
                    <div className="mt-4 rounded-lg bg-card p-5 text-left text-base md:text-lg font-bold shadow-sm border border-gold/30">
                      {TOPICS[result.idx]}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-4">
                    <FileText className="mx-auto mb-3 h-12 w-12 text-primary/50 animate-pulse" />
                    <p className="font-bold text-base md:text-lg text-primary/90 tracking-wide">
                      Nhấn chọn đối tượng, sau đó nhấn "Bốc đề"
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - History table */}
          <div className="flex flex-col rounded-lg border bg-card">
            <div className="border-b bg-secondary/50 px-3 py-2 shrink-0">
              <h5 className="text-sm font-semibold text-foreground/80">
                Lịch sử bốc đề <span className="text-muted-foreground">({data.topicDraws.length})</span>
              </h5>
            </div>
            <div className="max-h-[500px] overflow-auto flex-1">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
                  <tr className="text-left">
                    <th className="px-2 py-2 text-[10px] font-semibold">#</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Cấp bậc</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Họ tên</th>
                    <th className="px-2 py-2 text-[10px] font-semibold">Đề</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topicDraws.length === 0 && (
                    <tr><td colSpan={4} className="px-2 py-3 text-center text-[10px] text-muted-foreground">Chưa có</td></tr>
                  )}
                  {data.topicDraws.map((d, i) => (
                    <tr key={d.id} className="border-t hover:bg-accent/30 text-[10px]">
                      <td className="px-2 py-1.5 text-muted-foreground">{data.topicDraws.length - i}</td>
                      <td className="px-2 py-1.5">{d.rank}</td>
                      <td className="px-2 py-1.5 font-medium truncate">{d.contestantName}</td>
                      <td className="px-2 py-1.5"><Badge className="bg-gold text-gold-foreground text-[9px] px-1.5">Đề {d.topicIndex + 1}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-gold/30 shadow-[0_0_50px_rgba(234,179,8,0.25)] rounded-2xl p-6">
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
                      KẾT QUẢ BỐC THĂM ĐỀ THI
                    </h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                      CHUẨN BỊ DỰ THẢO NGHỊ QUYẾT
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-sm text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block text-[10px] md:text-xs px-2.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-yellow-400 font-bold uppercase tracking-wider">
                          ĐỐI TƯỢNG {result.group}
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
                      ĐỀ THI SỐ {result.idx + 1}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-gold/20 rounded-xl p-5 text-center text-slate-200 shadow-inner">
                    <div className="font-semibold text-gold mb-2 text-xs uppercase tracking-wider border-b border-white/5 pb-1 w-32 mx-auto">
                      Nội dung đề bài
                    </div>
                    <div className="mt-3 text-center text-[25px] md:text-[36px] font-bold text-slate-100 leading-relaxed max-w-2xl mx-auto whitespace-pre-wrap">
                      {TOPICS[result.idx]}
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
