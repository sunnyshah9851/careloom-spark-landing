import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as DayPickerCalendar } from "@/components/ui/calendar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { startOfMonth, endOfMonth, isSameMonth, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

type Relationship = {
  id: string;
  name: string;
  birthday?: string;        // "YYYY-MM-DD"
  anniversary?: string;     // "YYYY-MM-DD"
  relationship_type?: string;
};

type Props = {
  relationships: Relationship[];
};

const parseYMDLocal = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1); // local midnight
};

const thisYearOccurrence = (ymd: string, year: number) => {
  const d = parseYMDLocal(ymd);
  return new Date(year, d.getMonth(), d.getDate());
};

const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function DashboardMiniCalendar({ relationships }: Props) {
  const [month, setMonth] = useState<Date>(new Date()); // visible month

  const {
    birthdayDates,
    anniversaryDates,
    bothDates,
    birthdayNamesByDay,
    anniversaryNamesByDay,
  } = useMemo(() => {
    const visibleYear = month.getFullYear();
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const birthdays: Date[] = [];
    const anniversaries: Date[] = [];
    const bdayNames = new Map<string, string[]>();
    const annNames = new Map<string, string[]>();

    for (const r of relationships ?? []) {
      if (r.birthday) {
        const occ = thisYearOccurrence(r.birthday, visibleYear);
        if (occ >= start && occ <= end && isSameMonth(occ, month)) {
          birthdays.push(occ);
          const k = localKey(occ);
          bdayNames.set(k, [...(bdayNames.get(k) ?? []), r.name]);
        }
      }
      if (r.anniversary) {
        const occ = thisYearOccurrence(r.anniversary, visibleYear);
        if (occ >= start && occ <= end && isSameMonth(occ, month)) {
          anniversaries.push(occ);
          const k = localKey(occ);
          annNames.set(k, [...(annNames.get(k) ?? []), r.name]);
        }
      }
    }

    // dedup within each list
    const dedup = (arr: Date[]) =>
      arr.filter((d, i) => arr.findIndex(dd => isSameDay(dd, d)) === i);

    const bDedup = dedup(birthdays);
    const aDedup = dedup(anniversaries);

    // intersection (days that are both)
    const aKeys = new Set(aDedup.map(localKey));
    const both = bDedup.filter(d => aKeys.has(localKey(d)));

    // remove intersection from individual lists so classNames don’t fight
    const bothKeys = new Set(both.map(localKey));
    const bOnly = bDedup.filter(d => !bothKeys.has(localKey(d)));
    const aOnly = aDedup.filter(d => !bothKeys.has(localKey(d)));

    return {
      birthdayDates: bOnly,
      anniversaryDates: aOnly,
      bothDates: both,
      birthdayNamesByDay: bdayNames,
      anniversaryNamesByDay: annNames,
    };
  }, [relationships, month]);

  // apply background highlight only (no icons)
  const modifiers = {
    birthday: birthdayDates,
    anniversary: anniversaryDates,
    both: bothDates,
    today: [new Date()],
  };

  const modifiersClassNames = {
    birthday:
      "font-semibold bg-amber-100 text-amber-900 border border-amber-200",
    anniversary:
      "font-semibold bg-rose-100 text-rose-900 border border-rose-200",
    both:
      "font-semibold bg-violet-100 text-violet-900 border border-violet-200",
    today: "ring-2 ring-blue-500 ring-offset-2",
  };

  // Day renderer: no symbols behind the date; show tooltip with names
  const DayContent = ({ date }: { date: Date }) => {
    const k = localKey(date);
    const bnames = birthdayNamesByDay.get(k) ?? [];
    const annames = anniversaryNamesByDay.get(k) ?? [];
    const hasAny = bnames.length > 0 || annames.length > 0;

    const inner = (
      <div className="relative flex items-center justify-center w-full h-full">
        <span className="tabular-nums">{date.getDate()}</span>
      </div>
    );

    if (!hasAny) return inner;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs">
          <div className="space-y-1">
            {bnames.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-0.5">Birthdays</p>
                <ul className="text-xs text-amber-900 list-disc pl-4">
                  {bnames.map((n, i) => (
                    <li key={`b-${i}`}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            {annames.length > 0 && (
              <div className={bnames.length ? "pt-1" : ""}>
                <p className="text-xs font-semibold text-rose-800 mb-0.5">Anniversaries</p>
                <ul className="text-xs text-rose-900 list-disc pl-4">
                  {annames.map((n, i) => (
                    <li key={`a-${i}`}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Card className="shadow-lg border-2 border-blue-100 bg-white">
      <CardHeader className="pb-3">
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={150}>
          <DayPickerCalendar
            mode="single"
            selected={undefined}
            onSelect={() => {}}
            month={month}
            onMonthChange={setMonth}
            className="rounded-xl"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            components={{ DayContent }}
          />
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded bg-amber-200 border border-amber-300" />
            <span className="text-gray-700">Birthday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded bg-rose-200 border border-rose-300" />
            <span className="text-gray-700">Anniversary</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
