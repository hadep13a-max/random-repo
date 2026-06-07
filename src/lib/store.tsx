import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AppData, Contestant, QuestionItem, TableDrawRecord, TopicDrawRecord, QuestionDrawRecord, GroupId } from "./types";
import { DEFAULT_CONTESTANTS, DEFAULT_QUESTIONS } from "./constants";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY = "exam-draw-app-v1";
const ADMIN_KEY = "exam-draw-admin-v1";

// Mapping helpers to bridge camelCase (TS) and snake_case (PostgreSQL)
function mapContestantToDb(c: Contestant) {
  return {
    id: c.id,
    stt: c.stt,
    name: c.name,
    rank: c.rank,
    position: c.position,
    unit: c.unit,
    group: c.group
  };
}

function mapContestantFromDb(row: any): Contestant {
  return {
    id: row.id,
    stt: row.stt,
    name: row.name,
    rank: row.rank,
    position: row.position,
    unit: row.unit,
    group: row.group as GroupId
  };
}

function mapQuestionToDb(q: QuestionItem) {
  return {
    id: q.id,
    number: q.number,
    text: q.text
  };
}

function mapQuestionFromDb(row: any): QuestionItem {
  return {
    id: row.id,
    number: row.number,
    text: row.text
  };
}

function mapTableDrawToDb(r: TableDrawRecord) {
  return {
    id: r.id,
    contestant_id: r.contestantId,
    contestant_name: r.contestantName,
    rank: r.rank,
    position: r.position,
    unit: r.unit,
    table: r.table,
    turn: r.turn,
    at: r.at
  };
}

function mapTableDrawFromDb(row: any): TableDrawRecord {
  return {
    id: row.id,
    contestantId: row.contestant_id,
    contestantName: row.contestant_name,
    rank: row.rank,
    position: row.position,
    unit: row.unit,
    table: row.table as 1 | 2,
    turn: row.turn,
    at: Number(row.at)
  };
}

function mapTopicDrawToDb(r: TopicDrawRecord) {
  return {
    id: r.id,
    contestant_id: r.contestantId,
    contestant_name: r.contestantName,
    rank: r.rank,
    position: r.position,
    unit: r.unit,
    group: r.group,
    topic_index: r.topicIndex,
    topic_text: r.topicText,
    at: r.at
  };
}

function mapTopicDrawFromDb(row: any): TopicDrawRecord {
  return {
    id: row.id,
    contestantId: row.contestant_id,
    contestantName: row.contestant_name,
    rank: row.rank,
    position: row.position,
    unit: row.unit,
    group: row.group as GroupId,
    topicIndex: row.topic_index,
    topicText: row.topic_text,
    at: Number(row.at)
  };
}

function mapQuestionDrawToDb(r: QuestionDrawRecord) {
  return {
    id: r.id,
    contestant_id: r.contestantId,
    contestant_name: r.contestantName,
    rank: r.rank,
    position: r.position,
    unit: r.unit,
    question_id: r.questionId,
    question_number: r.questionNumber,
    question_text: r.questionText,
    at: r.at
  };
}

function mapQuestionDrawFromDb(row: any): QuestionDrawRecord {
  return {
    id: row.id,
    contestantId: row.contestant_id,
    contestantName: row.contestant_name,
    rank: row.rank,
    position: row.position,
    unit: row.unit,
    questionId: row.question_id,
    questionNumber: row.question_number,
    questionText: row.question_text,
    at: Number(row.at)
  };
}

function loadData(): AppData {
  if (typeof window === "undefined") {
    return { contestants: DEFAULT_CONTESTANTS, questions: DEFAULT_QUESTIONS, tableDraws: [], topicDraws: [], questionDraws: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { contestants: DEFAULT_CONTESTANTS, questions: DEFAULT_QUESTIONS, tableDraws: [], topicDraws: [], questionDraws: [] };
}

interface Ctx {
  data: AppData;
  isAdmin: boolean;
  isLoading: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  setContestants: (c: Contestant[]) => void;
  setQuestions: (q: QuestionItem[]) => void;
  addTableDraw: (r: TableDrawRecord) => void;
  addTopicDraw: (r: TopicDrawRecord) => void;
  addQuestionDraw: (r: QuestionDrawRecord) => void;
  resetTableDraws: () => void;
  resetTopicDraws: () => void;
  resetQuestionDraws: () => void;
  importDraws: (tableDraws: TableDrawRecord[], topicDraws: TopicDrawRecord[], questionDraws: QuestionDrawRecord[]) => Promise<void>;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    async function loadFromSupabase() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const [
          { data: contestants, error: errC },
          { data: questions, error: errQ },
          { data: tableDraws, error: errTD },
          { data: topicDraws, error: errTPD },
          { data: questionDraws, error: errQD }
        ] = await Promise.all([
          supabase.from("contestants").select("*").order("stt", { ascending: true }),
          supabase.from("questions").select("*").order("number", { ascending: true }),
          supabase.from("table_draws").select("*").order("at", { ascending: false }),
          supabase.from("topic_draws").select("*").order("at", { ascending: false }),
          supabase.from("question_draws").select("*").order("at", { ascending: false })
        ]);

        if (errC) throw errC;
        if (errQ) throw errQ;
        if (errTD) throw errTD;
        if (errTPD) throw errTPD;
        if (errQD) throw errQD;

        let finalContestants = contestants ? contestants.map(mapContestantFromDb) : [];
        let finalQuestions = questions ? questions.map(mapQuestionFromDb) : [];

        // Seed default database values if empty
        if (finalContestants.length === 0) {
          finalContestants = DEFAULT_CONTESTANTS;
          const { error } = await supabase.from("contestants").insert(DEFAULT_CONTESTANTS.map(mapContestantToDb));
          if (error) console.error("Error seeding contestants:", error);
        }

        if (finalQuestions.length === 0) {
          finalQuestions = DEFAULT_QUESTIONS;
          const { error } = await supabase.from("questions").insert(DEFAULT_QUESTIONS.map(mapQuestionToDb));
          if (error) console.error("Error seeding questions:", error);
        }

        setData({
          contestants: finalContestants,
          questions: finalQuestions,
          tableDraws: tableDraws ? tableDraws.map(mapTableDrawFromDb) : [],
          topicDraws: topicDraws ? topicDraws.map(mapTopicDrawFromDb) : [],
          questionDraws: questionDraws ? questionDraws.map(mapQuestionDrawFromDb) : [],
        });
      } catch (err: any) {
        console.error("Failed to load from Supabase:", err);
        toast.error("Không thể kết nối với Supabase, đang sử dụng LocalStorage để dự phòng.");
        setData(loadData());
      } finally {
        setIsLoading(false);
      }
    }

    loadFromSupabase();

    try {
      setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    }
  }, [data]);

  const update = useCallback((patch: Partial<AppData>) => setData((d) => ({ ...d, ...patch })), []);

  const ctx: Ctx = {
    data,
    isAdmin,
    isLoading,
    login: (u, p) => {
      const ok = u === "admin" && p === "admin123";
      if (ok) {
        try { sessionStorage.setItem(ADMIN_KEY, "1"); } catch {}
        setIsAdmin(true);
      }
      return ok;
    },
    logout: () => {
      try { sessionStorage.removeItem(ADMIN_KEY); } catch {}
      setIsAdmin(false);
    },
    setContestants: async (c) => {
      update({ contestants: c });
      if (supabase) {
        try {
          const { error: delError } = await supabase.from("contestants").delete().neq("id", "");
          if (delError) throw delError;
          if (c.length > 0) {
            const { error: insError } = await supabase.from("contestants").insert(c.map(mapContestantToDb));
            if (insError) throw insError;
          }
        } catch (err: any) {
          toast.error("Không thể lưu danh sách người thi vào Supabase: " + err.message);
        }
      }
    },
    setQuestions: async (q) => {
      update({ questions: q });
      if (supabase) {
        try {
          const { error: delError } = await supabase.from("questions").delete().neq("id", "");
          if (delError) throw delError;
          if (q.length > 0) {
            const { error: insError } = await supabase.from("questions").insert(q.map(mapQuestionToDb));
            if (insError) throw insError;
          }
        } catch (err: any) {
          toast.error("Không thể lưu danh sách câu hỏi vào Supabase: " + err.message);
        }
      }
    },
    addTableDraw: async (r) => {
      setData((d) => ({ ...d, tableDraws: [r, ...d.tableDraws] }));
      if (supabase) {
        try {
          const { error } = await supabase.from("table_draws").insert(mapTableDrawToDb(r));
          if (error) throw error;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    addTopicDraw: async (r) => {
      setData((d) => ({ ...d, topicDraws: [r, ...d.topicDraws] }));
      if (supabase) {
        try {
          const { error } = await supabase.from("topic_draws").insert(mapTopicDrawToDb(r));
          if (error) throw error;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    addQuestionDraw: async (r) => {
      setData((d) => ({ ...d, questionDraws: [r, ...d.questionDraws] }));
      if (supabase) {
        try {
          const { error } = await supabase.from("question_draws").insert(mapQuestionDrawToDb(r));
          if (error) throw error;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    resetTableDraws: async () => {
      update({ tableDraws: [], questionDraws: [] });
      if (supabase) {
        try {
          const { error: tableError } = await supabase.from("table_draws").delete().neq("id", "");
          if (tableError) throw tableError;
          const { error: questionError } = await supabase.from("question_draws").delete().neq("id", "");
          if (questionError) throw questionError;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    resetTopicDraws: async () => {
      update({ topicDraws: [] });
      if (supabase) {
        try {
          const { error } = await supabase.from("topic_draws").delete().neq("id", "");
          if (error) throw error;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    resetQuestionDraws: async () => {
      update({ questionDraws: [] });
      if (supabase) {
        try {
          const { error } = await supabase.from("question_draws").delete().neq("id", "");
          if (error) throw error;
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase: " + err.message);
        }
      }
    },
    importDraws: async (tableDraws, topicDraws, questionDraws) => {
      setData((d) => ({
        ...d,
        tableDraws,
        topicDraws,
        questionDraws
      }));
      if (supabase) {
        try {
          // Delete existing draws
          await Promise.all([
            supabase.from("table_draws").delete().neq("id", ""),
            supabase.from("topic_draws").delete().neq("id", ""),
            supabase.from("question_draws").delete().neq("id", "")
          ]);
          // Insert new draws if any
          const promises = [];
          if (tableDraws.length > 0) {
            promises.push(supabase.from("table_draws").insert(tableDraws.map(mapTableDrawToDb)));
          }
          if (topicDraws.length > 0) {
            promises.push(supabase.from("topic_draws").insert(topicDraws.map(mapTopicDrawToDb)));
          }
          if (questionDraws.length > 0) {
            promises.push(supabase.from("question_draws").insert(questionDraws.map(mapQuestionDrawToDb)));
          }
          if (promises.length > 0) {
            const results = await Promise.all(promises);
            const err = results.find(r => r.error);
            if (err) throw err.error;
          }
        } catch (err: any) {
          toast.error("Lỗi đồng bộ Supabase khi nhập Excel: " + err.message);
        }
      }
    },
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 z-[9999]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-gold animate-spin-slow"></div>
          </div>
          <h3 className="text-lg font-semibold tracking-wide text-foreground">Đang tải dữ liệu...</h3>
          <p className="text-xs text-muted-foreground">Vui lòng đợi kết nối tới Supabase</p>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}

