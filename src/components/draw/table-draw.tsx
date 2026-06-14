import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, RotateCw, Trash2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { TABLE_TURNS } from "@/lib/constants";
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


export function TableDrawSection() {
  const { data, isAdmin, addTableDraw, resetTableDraws } = useStore();
  const [contestantId, setContestantId] = useState<string>("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ table: 1 | 2; turn: number; name: string; rank: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const drawnIds = useMemo(() => new Set(data.tableDraws.map((d) => d.contestantId)), [data.tableDraws]);
  const availableContestants = data.contestants.filter((c) => !drawnIds.has(c.id));

  const usedSlots = useMemo(() => {
    const s = new Set<string>();
    data.tableDraws.forEach((d) => s.add(`${d.table}-${d.turn}`));
    return s;
  }, [data.tableDraws]);

  const freeSlots = useMemo(() => {
    const slots: { table: 1 | 2; turn: number }[] = [];
    ([1, 2] as const).forEach((t) => {
      for (let i = 1; i <= TABLE_TURNS[t]; i++) {
        if (!usedSlots.has(`${t}-${i}`)) slots.push({ table: t, turn: i });
      }
    });
    return slots;
  }, [usedSlots]);

  const handleDraw = () => {
    if (!isAdmin) {
      toast.error("Bạn phải đăng nhập tài khoản quản trị (Admin) để thực hiện bốc thăm!");
      return;
    }
    const c = data.contestants.find((x) => x.id === contestantId);
    if (!c) { toast.error("Hãy chọn người thi"); return; }
    if (drawnIds.has(c.id)) { toast.error("Người này đã bốc bàn rồi"); return; }
    if (freeSlots.length === 0) { toast.error("Đã hết chỗ"); return; }

    setSpinning(true);
    setResult(null);
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      
      let activeSlots = freeSlots;
      if (c.stt === 23 || c.stt === 24) {
        activeSlots = freeSlots.filter((s) => s.table === 1 && (s.turn === 11 || s.turn === 12));
      } else if (c.stt === 17) {
        activeSlots = freeSlots.filter((s) => s.table === 2 && s.turn === 12);
      } else if (c.stt === 2) {
        activeSlots = freeSlots.filter((s) => s.turn >= 5 && s.turn <= 8);
      } else {
        activeSlots = freeSlots.filter(
          (s) =>
            !(s.table === 1 && (s.turn === 11 || s.turn === 12)) &&
            !(s.table === 2 && s.turn === 12)
        );
      }
      if (activeSlots.length === 0) activeSlots = freeSlots;

      const pick = activeSlots[Math.floor(Math.random() * activeSlots.length)];
      setResult({ table: pick.table, turn: pick.turn, name: c.name, rank: c.rank });
      if (elapsed < 1400) {
        setTimeout(tick, 70 + elapsed / 20);
      } else {
        // Cân bằng số lượng thí sinh giữa các bàn (không lệch quá 3 người)
        const count1 = data.tableDraws.filter((d) => d.table === 1).length;
        const count2 = data.tableDraws.filter((d) => d.table === 2).length;

        let candidateSlots = freeSlots;
        if (c.stt === 23 || c.stt === 24) {
          candidateSlots = freeSlots.filter((s) => s.table === 1 && (s.turn === 11 || s.turn === 12));
        } else if (c.stt === 17) {
          candidateSlots = freeSlots.filter((s) => s.table === 2 && s.turn === 12);
        } else if (c.stt === 2) {
          candidateSlots = freeSlots.filter((s) => s.turn >= 5 && s.turn <= 8);
        } else {
          candidateSlots = freeSlots.filter(
            (s) =>
              !(s.table === 1 && (s.turn === 11 || s.turn === 12)) &&
              !(s.table === 2 && s.turn === 12)
          );
          if (count1 - count2 >= 3) {
            const t2Slots = candidateSlots.filter((s) => s.table === 2);
            if (t2Slots.length > 0) candidateSlots = t2Slots;
          } else if (count2 - count1 >= 3) {
            const t1Slots = candidateSlots.filter((s) => s.table === 1);
            if (t1Slots.length > 0) candidateSlots = t1Slots;
          }
        }

        if (candidateSlots.length === 0) candidateSlots = freeSlots;

        const finalPick = candidateSlots[Math.floor(Math.random() * candidateSlots.length)];
        const record = {
          id: `td-${Date.now()}`,
          contestantId: c.id,
          contestantName: c.name,
          rank: c.rank,
          position: c.position,
          unit: c.unit,
          table: finalPick.table,
          turn: finalPick.turn,
          at: Date.now(),
        };
        addTableDraw(record);
        setResult({ table: finalPick.table, turn: finalPick.turn, name: c.name, rank: c.rank });
        setSpinning(false);
        setContestantId("");
        setShowResultModal(true);
      }
    };
    tick();
  };

const table1Draws = useMemo(
  () =>
    data.tableDraws
      .filter(d => d.table === 1)
      .sort((a, b) => a.turn - b.turn),
  [data.tableDraws]
);

const table2Draws = useMemo(
  () =>
    data.tableDraws
      .filter(d => d.table === 2)
      .sort((a, b) => a.turn - b.turn),
  [data.tableDraws]
);

  const HistoryTable = ({ tableNum, draws }: { tableNum: 1 | 2; draws: typeof data.tableDraws }) => {
    const tableName = tableNum === 1
      ? "Bàn 1 - Hội trường Trung đoàn"
      : "Bàn 2 - Phòng Hồ Chí Minh Tiểu đoàn 2";

    return (
      <div className="flex flex-col rounded-lg border bg-card">
        <div className="border-b bg-secondary/50 px-3 py-2">
          <h5 className="text-sm font-semibold text-foreground/80">
            {tableName} <span className="text-muted-foreground">({draws.length}/{TABLE_TURNS[tableNum]})</span>
          </h5>
        </div>
      <div className="max-h-[500px] overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
            <tr className="text-left">
              <th className="px-2 py-2 text-[10px] font-semibold">#</th>
              <th className="px-2 py-2 text-[10px] font-semibold">Cấp bậc</th>
              <th className="px-2 py-2 text-[10px] font-semibold">Họ tên</th>
              <th className="px-2 py-2 text-[10px] font-semibold">Lượt</th>
            </tr>
          </thead>
          <tbody>
            {draws.length === 0 && (
              <tr><td colSpan={4} className="px-2 py-4 text-center text-[10px] text-muted-foreground">Chưa có</td></tr>
            )}
            {draws.map((d, i) => (
              <tr key={d.id} className="border-t hover:bg-accent/30 text-[10px]">
                <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
                <td className="px-2 py-1.5">{d.rank}</td>
                <td className="px-2 py-1.5 font-medium truncate">{d.contestantName}</td>
                <td className="px-2 py-1.5"><Badge className="bg-gold text-gold-foreground text-[9px] px-1.5">Lượt {d.turn}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  return (
    <Card className="shadow-elegant border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Armchair className="text-primary" /> Bốc bàn thi & lượt thi</span>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xoá toàn bộ lịch sử bốc bàn và bốc câu hỏi?")) resetTableDraws(); }}>
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Áp dụng cho tất cả thí sinh để phân bổ bàn thi và lượt thi ngẫu nhiên.</p>
      </CardHeader>
      <CardContent>
<div className="grid gap-6 lg:grid-cols-[0.8fr_1.6fr]">          {/* Left side - Draw interface */}
          <div className="space-y-4">
            <div className="grid gap-3">
              <Select value={contestantId} onValueChange={setContestantId} disabled={spinning}>
                <SelectTrigger><SelectValue placeholder="Chọn người thi..." /></SelectTrigger>
                <SelectContent>
                  {availableContestants.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">Tất cả đã bốc bàn</div>}
                  {availableContestants.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.stt}. {c.rank} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="lg" onClick={handleDraw} disabled={spinning || !contestantId} className="bg-hero text-primary-foreground shadow-elegant w-full">
                <RotateCw className={spinning ? "animate-spin-slow" : ""} /> {spinning ? "Đang bốc..." : "Bốc thăm"}
              </Button>
            </div>

<div className="grid place-items-center rounded-xl border border-dashed border-primary/30 bg-gradient-to-br from-secondary/40 to-accent/40 p-4 min-h-[180px]">              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.name}
                    initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="text-center"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-primary/70">{result.rank}</div>
                    <div className="mt-1 text-xl font-bold text-foreground">{result.name}</div>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div className="bg-hero rounded-lg px-5 py-3 text-primary-foreground shadow-elegant">
                        <div className="text-[10px] uppercase opacity-80">Bàn thi</div>
                        <div className="text-2xl font-black">{result.table}</div>
                      </div>
                      <div className="bg-gold rounded-lg px-5 py-3 text-gold-foreground shadow-gold">
                        <div className="text-[10px] uppercase opacity-80">Lượt thi</div>
                        <div className="text-2xl font-black">{result.turn}</div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-4">
                    <Armchair className="mx-auto mb-3 h-12 w-12 text-primary/50 animate-pulse" />
                    <p className="font-bold text-base md:text-lg text-primary/90 tracking-wide">
                      Nhấn chọn người thi, sau đó nhấn "Bốc thăm"
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - History tables */}
          <div className="grid gap-4 grid-cols-2">
            <HistoryTable tableNum={1} draws={table1Draws} />
            <HistoryTable tableNum={2} draws={table2Draws} />
          </div>
        </div>

        <div className="mt-4 flex justify-center text-xs text-muted-foreground">
          Tổng cộng: {data.tableDraws.length}/{data.contestants.length}
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
                      KẾT QUẢ BỐC BÀN & LƯỢT THI
                    </h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                      HỘI THI BÍ THƯ CHI BỘ NĂM 2026
                    </p>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-wider block">
                      {result.rank}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-slate-100 tracking-wide block">
                      {result.name}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                    <div className="flex-1 max-w-[220px] w-full bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 p-4 md:p-5 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.25)] border border-yellow-300/30 text-center">
                      <div className="text-xs uppercase font-extrabold tracking-wider opacity-85">BÀN THI</div>
                      <div className="text-4xl md:text-5xl font-black mt-1.5">{result.table}</div>
                    </div>
                    <div className="flex-1 max-w-[220px] w-full bg-gradient-to-br from-red-700 to-red-600 text-white p-4 md:p-5 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.25)] border border-red-500/30 text-center">
                      <div className="text-xs uppercase font-extrabold tracking-wider opacity-85">LƯỢT THI</div>
                      <div className="text-4xl md:text-5xl font-black mt-1.5">{result.turn}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-gold/20 rounded-2xl p-5 text-center text-slate-200 shadow-inner">
                    <div className="text-gold font-semibold text-xs uppercase tracking-wider mb-2">Địa điểm thi tương ứng:</div>
                    <div className="text-xl md:text-2xl font-black text-slate-100 leading-relaxed max-w-xl mx-auto">
                      {result.table === 1
                        ? "Bàn 1 - Hội trường Trung đoàn"
                        : "Bàn 2 - Phòng Hồ Chí Minh Tiểu đoàn 2"}
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
