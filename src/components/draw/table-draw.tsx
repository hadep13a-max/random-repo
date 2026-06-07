import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, RotateCw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { TABLE_TURNS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function TableDrawSection() {
  const { data, isAdmin, addTableDraw, resetTableDraws } = useStore();
  const [contestantId, setContestantId] = useState<string>("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ table: 1 | 2; turn: number; name: string; rank: string } | null>(null);

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
    const c = data.contestants.find((x) => x.id === contestantId);
    if (!c) { toast.error("Hãy chọn người thi"); return; }
    if (drawnIds.has(c.id)) { toast.error("Người này đã bốc bàn rồi"); return; }
    if (freeSlots.length === 0) { toast.error("Đã hết chỗ"); return; }

    setSpinning(true);
    setResult(null);
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const pick = freeSlots[Math.floor(Math.random() * freeSlots.length)];
      setResult({ table: pick.table, turn: pick.turn, name: c.name, rank: c.rank });
      if (elapsed < 1400) {
        setTimeout(tick, 70 + elapsed / 20);
      } else {
        // Cân bằng số lượng thí sinh giữa các bàn (không lệch quá 3 người)
        const count1 = data.tableDraws.filter((d) => d.table === 1).length;
        const count2 = data.tableDraws.filter((d) => d.table === 2).length;

        let candidateSlots = freeSlots;
        if (count1 - count2 >= 3) {
          const t2Slots = freeSlots.filter((s) => s.table === 2);
          if (t2Slots.length > 0) candidateSlots = t2Slots;
        } else if (count2 - count1 >= 3) {
          const t1Slots = freeSlots.filter((s) => s.table === 1);
          if (t1Slots.length > 0) candidateSlots = t1Slots;
        }

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
        toast.success(`${c.rank} ${c.name} — Bàn ${finalPick.table}, Lượt ${finalPick.turn}`);
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

  const HistoryTable = ({ tableNum, draws }: { tableNum: 1 | 2; draws: typeof data.tableDraws }) => (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="border-b bg-secondary/50 px-3 py-2">
        <h5 className="text-sm font-semibold text-foreground/80">
          Bàn {tableNum} <span className="text-muted-foreground">({draws.length}/{TABLE_TURNS[tableNum]})</span>
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

  return (
    <Card className="shadow-elegant border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Armchair className="text-primary" /> Bốc bàn thi & lượt thi</span>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xoá toàn bộ lịch sử bốc bàn?")) resetTableDraws(); }}>
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Áp dụng cho tất cả thí sinh để phân bổ bàn thi và lượt thi ngẫu nhiên (chênh lệch giữa các bàn tối đa 3 thí sinh).</p>
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
                    key={`${result.table}-${result.turn}-${spinning}`}
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
                  <div className="text-center text-muted-foreground">
                    <Armchair className="mx-auto mb-2 h-10 w-10 opacity-40" />
                    Chọn người thi và nhấn "Bốc thăm"
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
          Tổng cộng: {data.tableDraws.length}/21
        </div>
      </CardContent>
    </Card>
  );
}
