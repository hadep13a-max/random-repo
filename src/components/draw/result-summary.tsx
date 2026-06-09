import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  ArrowUpDown,
  Download,
  Upload,
} from "lucide-react";
import { TOPICS } from "@/lib/constants";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type SortField =
  | "stt"
  | "table"
  | "turn"
  | "topic"
  | "question";

export function ResultSummarySection() {
  const { data, isAdmin, importDraws } = useStore();

  const [sortField, setSortField] =
    useState<SortField>("stt");

  const [ascending, setAscending] =
    useState(true);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setAscending(!ascending);
    } else {
      setSortField(field);
      setAscending(true);
    }
  };

  const rows = useMemo(() => {
    const result = data.contestants.map((c) => {
      const table = data.tableDraws.find(
        (x) => x.contestantId === c.id
      );

      const topic = data.topicDraws.find(
        (x) => x.contestantId === c.id
      );

      const question = data.questionDraws.find(
        (x) => x.contestantId === c.id
      );

      return {
        stt: c.stt,
        rank: c.rank,
        name: c.name,
        unit: c.unit,

        table: Number(table?.table ?? 999),
        turn: Number(table?.turn ?? 999),

        topic:
          topic?.topicIndex !== undefined
            ? topic.topicIndex + 1
            : 999,

        question: Number(
          question?.questionNumber ?? 999
        ),
      };
    });

    result.sort((a, b) => {
      // 1. Primary sort based on the selected field
      const av = a[sortField];
      const bv = b[sortField];

      if (av !== bv) {
        if (typeof av === "number" && typeof bv === "number") {
          return ascending ? av - bv : bv - av;
        }
      }

      // 2. Secondary/Tertiary sort when primary field is equal
      if (sortField === "table") {
        // Table is equal -> sub-sort by turn ascending, then by stt ascending
        if (a.turn !== b.turn) return a.turn - b.turn;
        return a.stt - b.stt;
      } else if (sortField === "turn") {
        // Turn is equal -> sub-sort by table ascending, then by stt ascending
        if (a.table !== b.table) return a.table - b.table;
        return a.stt - b.stt;
      } else {
        // For other fields (stt, topic, question) -> sub-sort by table, then turn, then stt
        if (a.table !== b.table) return a.table - b.table;
        if (a.turn !== b.turn) return a.turn - b.turn;
        return a.stt - b.stt;
      }
    });

    return result;
  }, [data, sortField, ascending]);

  const exportToExcel = () => {
    const exportData = rows.map((r) => ({
      "STT": r.stt,
      "Cấp bậc": r.rank,
      "Họ tên": r.name,
      "Đơn vị": r.unit,
      "Bàn thi": r.table === 999 ? "" : r.table,
      "Lượt thi": r.turn === 999 ? "" : r.turn,
      "Đề": r.topic === 999 ? "" : r.topic,
      "Phiếu": r.question === 999 ? "" : r.question,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KetQuaBocTham");
    XLSX.writeFile(workbook, "Ket_qua_boc_tham.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json: any[] = XLSX.utils.sheet_to_json(ws);

        const newTableDraws: any[] = [];
        const newTopicDraws: any[] = [];
        const newQuestionDraws: any[] = [];

        data.contestants.forEach((c) => {
          const row = json.find(
            (r) =>
              Number(r["STT"]) === c.stt ||
              String(r["Họ tên"] || "").trim().toLowerCase() === c.name.trim().toLowerCase()
          );

          if (!row) return;

          // Parse Bàn thi and Lượt thi
          const tableVal = parseInt(row["Bàn thi"]);
          const turnVal = parseInt(row["Lượt thi"]);
          if ((tableVal === 1 || tableVal === 2) && !isNaN(turnVal)) {
            newTableDraws.push({
              id: `td-${c.id}-${Date.now()}-${Math.random()}`,
              contestantId: c.id,
              contestantName: c.name,
              rank: c.rank,
              position: c.position,
              unit: c.unit,
              table: tableVal,
              turn: turnVal,
              at: Date.now(),
            });
          }

          // Parse Đề
          const topicVal = parseInt(row["Đề"]);
          if (!isNaN(topicVal) && topicVal >= 1 && topicVal <= 3) {
            const topicIndex = topicVal - 1;
            newTopicDraws.push({
              id: `to-${c.id}-${Date.now()}-${Math.random()}`,
              contestantId: c.id,
              contestantName: c.name,
              rank: c.rank,
              position: c.position,
              unit: c.unit,
              group: c.group,
              topicIndex,
              topicText: TOPICS[topicIndex] || `Đề thi số ${topicVal}`,
              at: Date.now(),
            });
          }

          // Parse Phiếu (Question)
          const qVal = parseInt(row["Phiếu"]);
          if (!isNaN(qVal)) {
            const questionItem = data.questions.find((q) => q.number === qVal);
            newQuestionDraws.push({
              id: `qd-${c.id}-${Date.now()}-${Math.random()}`,
              contestantId: c.id,
              contestantName: c.name,
              rank: c.rank,
              position: c.position,
              unit: c.unit,
              questionId: questionItem?.id || `q-${qVal}`,
              questionNumber: qVal,
              questionText: questionItem?.text || `Phiếu số ${qVal}`,
              at: Date.now(),
            });
          }
        });

        if (newTableDraws.length === 0 && newTopicDraws.length === 0 && newQuestionDraws.length === 0) {
          toast.error("Không tìm thấy dữ liệu hợp lệ để nhập.");
          return;
        }

        await importDraws(newTableDraws, newTopicDraws, newQuestionDraws);
        toast.success(`Nhập thành công kết quả bốc thăm!`);
      } catch (error: any) {
        console.error(error);
        toast.error("Lỗi khi đọc file Excel: " + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortField;
  }) => (
    <th
      onClick={() => handleSort(field)}
      className="border p-2 cursor-pointer hover:bg-accent transition"
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </th>
  );

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Tổng hợp kết quả bốc thăm
        </CardTitle>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button size="sm" variant="outline" className="relative cursor-pointer">
              <Upload className="h-4 w-4 mr-1.5" />
              Nhập Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          )}
          <Button size="sm" onClick={exportToExcel} className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Download className="h-4 w-4 mr-1.5" />
            Xuất Excel
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <SortHeader
                  label="STT"
                  field="stt"
                />

                <th className="border p-2">
                  Cấp bậc
                </th>

                <th className="border p-2">
                  Họ tên
                </th>

                <th className="border p-2">
                  Đơn vị
                </th>

                <SortHeader
                  label="Bàn thi"
                  field="table"
                />

                <SortHeader
                  label="Lượt thi"
                  field="turn"
                />

                <SortHeader
                  label="Đề"
                  field="topic"
                />

                <SortHeader
                  label="Phiếu"
                  field="question"
                />
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.stt}
                  className="hover:bg-accent/30"
                >
                  <td className="border p-2 text-center font-medium">
                    {r.stt}
                  </td>

                  <td className="border p-2">
                    {r.rank}
                  </td>

                  <td className="border p-2 font-semibold">
                    {r.name}
                  </td>

                  <td className="border p-2">
                    {r.unit}
                  </td>

                  <td className="border p-2 text-center font-bold text-blue-600">
                    {r.table === 999 ? "" : r.table}
                  </td>

                  <td className="border p-2 text-center font-bold text-green-600">
                    {r.turn === 999 ? "" : r.turn}
                  </td>

                  <td className="border p-2 text-center font-bold text-amber-600">
                    {r.topic === 999 ? "" : r.topic}
                  </td>

                  <td className="border p-2 text-center font-bold text-red-600">
                    {r.question === 999 ? "" : r.question}
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