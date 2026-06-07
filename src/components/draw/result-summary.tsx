import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ListChecks,
  ArrowUpDown,
} from "lucide-react";

type SortField =
  | "stt"
  | "table"
  | "turn"
  | "topic"
  | "question";

export function ResultSummarySection() {
  const { data } = useStore();

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
      const av = a[sortField];
      const bv = b[sortField];

      if (typeof av === "number" && typeof bv === "number") {
        return ascending
          ? av - bv
          : bv - av;
      }

      return 0;
    });

    return result;
  }, [data, sortField, ascending]);

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Tổng hợp kết quả bốc thăm
        </CardTitle>
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