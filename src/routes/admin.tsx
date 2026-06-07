import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Users, ListChecks, Plus, Trash2, Pencil, Save, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Contestant, QuestionItem, GroupId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Quản trị — Hệ thống bốc thăm" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, login } = useStore();
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Card className="shadow-elegant border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="text-primary" /> Đăng nhập quản trị</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!login(u, p)) toast.error("Sai tài khoản hoặc mật khẩu");
                else toast.success("Đăng nhập thành công");
              }}
            >
              <div>
                <Label>Tài khoản</Label>
                <Input value={u} onChange={(e) => setU(e.target.value)} placeholder="admin" autoFocus />
              </div>
              <div>
                <Label>Mật khẩu</Label>
                <Input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-hero text-primary-foreground">Đăng nhập</Button>
              {/* <p className="text-center text-xs text-muted-foreground">Mặc định: admin / admin123</p> */}
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Bảng điều khiển quản trị</h1>
      <ContestantsAdmin />
      <QuestionsAdmin />
    </main>
  );
}

function ContestantsAdmin() {
  const { data, setContestants } = useStore();
  const [draft, setDraft] = useState<{ name: string; rank: string; position: string; unit: string; group: GroupId }>({ name: "", rank: "", position: "BTCB", unit: "", group: 1 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Contestant>>({});
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const add = () => {
    if (!draft.name.trim() || !draft.rank.trim()) return toast.error("Nhập đủ thông tin");
    const nextStt = data.contestants.length ? Math.max(...data.contestants.map(c => c.stt)) + 1 : 1;
    setContestants([...data.contestants, { id: `c-${Date.now()}`, stt: nextStt, name: draft.name.trim(), rank: draft.rank.trim(), position: draft.position.trim(), unit: draft.unit.trim(), group: draft.group }]);
    setDraft({ name: "", rank: "", position: "BTCB", unit: "", group: 1 });
    toast.success("Đã thêm");
  };

  const handleImport = () => {
    const lines = importText.trim().split('\n').filter(l => l.trim());
    const newContestants: Contestant[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim()).filter(p => p);
      if (parts.length < 4) continue;
      
      const stt = parseInt(parts[0]) || newContestants.length + 1;
      const name = parts[1];
      const rank = parts[2];
      const position = parts[3] || "BTCB";
      const unit = parts[4] || "";
      
      if (name && rank) {
        newContestants.push({
          id: `c-${Date.now()}-${Math.random()}`,
          stt,
          name,
          rank,
          position,
          unit,
          group: 1
        });
      }
    }
    
    if (newContestants.length === 0) return toast.error("Không có dữ liệu hợp lệ");
    setContestants([...data.contestants, ...newContestants]);
    setImportText("");
    setShowImport(false);
    toast.success(`Đã thêm ${newContestants.length} người thi`);
  };

  const remove = (id: string) => {
    if (!confirm("Xoá người thi này?")) return;
    setContestants(data.contestants.filter(c => c.id !== id));
  };

  const startEdit = (c: Contestant) => { setEditingId(c.id); setEdit(c); };
  const saveEdit = () => {
    setContestants(data.contestants.map(c => c.id === editingId ? { ...c, ...edit } as Contestant : c));
    setEditingId(null); setEdit({});
    toast.success("Đã lưu");
  };

  return (
    <Card className="shadow-elegant border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> Quản lý người thi ({data.contestants.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_160px_auto]">
              <Input placeholder="Họ tên" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <Input placeholder="Cấp bậc" value={draft.rank} onChange={(e) => setDraft({ ...draft, rank: e.target.value })} />
              <Input placeholder="Chức vụ đảng" value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} />
              <Input placeholder="Đơn vị" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
              <Select value={String(draft.group)} onValueChange={(v) => setDraft({ ...draft, group: Number(v) as GroupId })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Đối tượng 1</SelectItem>
                  <SelectItem value="2">Đối tượng 2</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={add} className="bg-hero text-primary-foreground"><Plus /> Thêm</Button>
            </div>
          </div>
          <Button onClick={() => setShowImport(!showImport)} variant="outline">📋 Nhập từ bảng</Button>
        </div>

        {showImport && (
          <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">Dán dữ liệu từ bảng (mỗi dòng: STT TAB Tên TAB Cấp bậc TAB Chức vụ đảng TAB Đơn vị)</p>
            <textarea 
              value={importText} 
              onChange={(e) => setImportText(e.target.value)}
              placeholder="1	Phan Ngọc Quyền	3/CTV/c	BTCB	c1/d1&#10;2	Phạm Trung Nguyên	2/CTV/c	BTCB	c2/d1"
              className="w-full h-24 p-2 text-xs border rounded bg-background font-mono"
            />
            <div className="flex gap-2">
              <Button onClick={handleImport} className="bg-hero text-primary-foreground text-xs">✓ Nhập dữ liệu</Button>
              <Button onClick={() => setShowImport(false)} variant="outline" className="text-xs">✕ Huỷ</Button>
            </div>
          </div>
        )}

        <div className="max-h-[480px] overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
              <tr className="text-left">
                <th className="px-3 py-2 w-12">STT</th>
                <th className="px-3 py-2">Cấp bậc</th>
                <th className="px-3 py-2">Họ tên</th>
                <th className="px-3 py-2">Chức vụ đảng</th>
                <th className="px-3 py-2">Đơn vị</th>
                <th className="px-3 py-2">Nhóm</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {data.contestants.map(c => editingId === c.id ? (
                <tr key={c.id} className="border-t bg-accent/30">
                  <td className="px-2 py-1"><Input type="number" value={edit.stt ?? c.stt} onChange={e => setEdit({ ...edit, stt: Number(e.target.value) })} className="h-8" /></td>
                  <td className="px-2 py-1"><Input value={edit.rank ?? c.rank} onChange={e => setEdit({ ...edit, rank: e.target.value })} className="h-8" /></td>
                  <td className="px-2 py-1"><Input value={edit.name ?? c.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className="h-8" /></td>
                  <td className="px-2 py-1"><Input value={edit.position ?? c.position} onChange={e => setEdit({ ...edit, position: e.target.value })} className="h-8" /></td>
                  <td className="px-2 py-1"><Input value={edit.unit ?? c.unit} onChange={e => setEdit({ ...edit, unit: e.target.value })} className="h-8" /></td>
                  <td className="px-2 py-1">
                    <Select value={String(edit.group ?? c.group)} onValueChange={v => setEdit({ ...edit, group: Number(v) as GroupId })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">Đối tượng 1</SelectItem><SelectItem value="2">Đối tượng 2</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1 flex gap-1">
                    <Button size="icon" variant="ghost" onClick={saveEdit}><Save className="text-primary" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(null); setEdit({}); }}><X /></Button>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t hover:bg-accent/30">
                  <td className="px-3 py-2 text-muted-foreground">{c.stt}</td>
                  <td className="px-3 py-2">{c.rank}</td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-sm">{c.position}</td>
                  <td className="px-3 py-2 text-sm">{c.unit}</td>
                  <td className="px-3 py-2"><Badge variant="secondary">Đối tượng {c.group}</Badge></td>
                  <td className="px-3 py-2 flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="text-primary" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionsAdmin() {
  const { data, setQuestions } = useStore();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    const next = data.questions.length ? Math.max(...data.questions.map(q => q.number)) + 1 : 1;
    setQuestions([...data.questions, { id: `q-${Date.now()}`, number: next, text: draft.trim() }]);
    setDraft("");
    toast.success("Đã thêm phiếu");
  };
  const remove = (id: string) => { if (confirm("Xoá phiếu này?")) setQuestions(data.questions.filter(q => q.id !== id)); };
  const saveEdit = (q: QuestionItem) => {
    setQuestions(data.questions.map(x => x.id === q.id ? { ...x, text: editText } : x));
    setEditingId(null);
  };

  return (
    <Card className="shadow-elegant border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListChecks className="text-primary" /> Quản lý phiếu câu hỏi ({data.questions.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <textarea placeholder="Nội dung phiếu câu hỏi mới..." value={draft} onChange={e => setDraft(e.target.value)} className="flex-1 h-20 p-2 border rounded bg-background font-mono text-sm" />
          <Button onClick={add} className="bg-hero text-primary-foreground h-fit"><Plus /> Thêm</Button>
        </div>
        <div className="max-h-[600px] overflow-auto rounded-lg border">
          <div className="space-y-3 p-3">
            {data.questions.map(q => (
              <div key={q.id} className="border rounded-lg p-3 bg-secondary/30 hover:bg-secondary/50 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className="bg-gold text-gold-foreground">Phiếu {q.number}</Badge>
                  <div className="flex gap-1">
                    {editingId === q.id ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => saveEdit(q)}><Save className="text-primary" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X /></Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(q.id); setEditText(q.text); }}><Pencil className="text-primary" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(q.id)}><Trash2 className="text-destructive" /></Button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === q.id ? (
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full h-40 p-2 border rounded bg-background font-mono text-sm" />
                ) : (
                  <div className="whitespace-pre-wrap text-sm text-foreground/80 font-mono max-h-[200px] overflow-auto">{q.text}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
