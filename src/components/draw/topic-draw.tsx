import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RotateCw, Trash2, Info, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { TOPICS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function TopicDrawSection() {
  const { data, isAdmin, addTopicDraw, resetTopicDraws } = useStore();
  const [contestantId, setContestantId] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ idx: number; name: string; rank: string } | null>(null);
  const [showTopics, setShowTopics] = useState(true);

  const drawnIds = useMemo(
    () => new Set(data.topicDraws.map((d) => d.contestantId)),
    [data.topicDraws]
  );

  const available = data.contestants.filter(
    (c) =>
      (c.stt === 1 || c.stt === 20) &&
      !drawnIds.has(c.id)
  );
  const handleDraw = () => {
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
      });

      if (elapsed < 1400) {
        setTimeout(tick, 80 + elapsed / 18);
      } else {
        const finalPick = 0;

        // Xác định nhóm được gán đề
        const relatedContestants =
          c.stt === 1
            ? data.contestants.filter(
              (x) => x.stt >= 1 && x.stt <= 19
            )
            : data.contestants.filter(
              (x) => x.stt >= 20 && x.stt <= 21
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
        });

        setSpinning(false);
        setContestantId("");

        toast.success(
          `${c.rank} ${c.name} đại diện nhóm ${c.stt === 1 ? "1-19" : "20-21"
          } bốc được Đề ${finalPick + 1}`
        );
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
                <ol className="space-y-1 text-xs">
                  {TOPICS.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <Badge className="bg-gold text-gold-foreground shrink-0">Đề {i + 1}</Badge>
                      <span className="text-foreground/80">{t}</span>
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
              <Select value={contestantId} onValueChange={setContestantId} disabled={spinning}>
                <SelectTrigger><SelectValue placeholder="Chọn người thi..." /></SelectTrigger>
                <SelectContent>
                  {available.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      Tất cả đã bốc đề
                    </div>
                  )}

                  {available.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.stt === 1
                        ? `${c.rank} ${c.name} (Đại diện STT 1-19)`
                        : `${c.rank} ${c.name} (Đại diện STT 20-21)`}
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
                    key={`${result.idx}-${spinning}`}
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
                      <div className="text-5xl font-black">{result.idx + 1}</div>
                    </div>
                    <div className="mt-4 rounded-lg bg-card p-4 text-left text-sm shadow-sm border border-gold/30">
                      {TOPICS[result.idx]}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-10 w-10 opacity-40" />
                    Chọn người thi và nhấn "Bốc đề"
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
    </Card>
  );
}
