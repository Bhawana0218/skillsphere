import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, RefreshCw, Trash2, WandSparkles } from "lucide-react";
import API from "../../services/api";

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: {
    name?: string;
    email?: string;
  } | null;
  job?: {
    _id?: string;
    title?: string;
  } | null;
}

const pad = (value: number) => String(value).padStart(2, "0");

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toMonthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const toTimeLabel = (isoValue: string) =>
  new Date(isoValue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const toRangeLabel = (startIso: string, endIso: string) =>
  `${toTimeLabel(startIso)} - ${toTimeLabel(endIso)}`;

const buildMonthDays = (monthCursor: Date) => {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDay.getDay();

  return {
    year,
    month,
    leadingDays,
    daysInMonth,
  };
};

const AvailabilityManager = () => {
  const now = new Date();
  const todayKey = toDateKey(now);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [monthCursor, setMonthCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [slotActionLoading, setSlotActionLoading] = useState(false);
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [autoConfig, setAutoConfig] = useState({
    fromDate: todayKey,
    toDate: toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)),
    slotDurationMinutes: "60",
    gapMinutes: "0",
  });

  const monthKey = toMonthKey(monthCursor);

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      const dateKey = toDateKey(new Date(slot.startTime));
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const monthSlots = useMemo(
    () =>
      slots.filter((slot) => {
        const slotMonth = toMonthKey(new Date(slot.startTime));
        return slotMonth === monthKey;
      }),
    [monthKey, slots]
  );

  const selectedDateSlots = useMemo(() => {
    const target = slotsByDate[selectedDate] || [];
    return [...target].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [selectedDate, slotsByDate]);

  const monthStats = useMemo(() => {
    const total = monthSlots.length;
    const booked = monthSlots.filter((slot) => slot.isBooked).length;
    return {
      total,
      booked,
      open: total - booked,
    };
  }, [monthSlots]);

  const fetchSlots = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await API.get<Slot[]>("/availability/mine");
      setSlots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setErrorMessage("Could not load availability slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSlots();
  }, []);

  const handleAddSlot = async () => {
    setSlotActionLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const localStart = new Date(`${selectedDate}T${startTime}`);
      const localEnd = new Date(`${selectedDate}T${endTime}`);

      if (
        Number.isNaN(localStart.getTime()) ||
        Number.isNaN(localEnd.getTime()) ||
        localEnd <= localStart
      ) {
        setErrorMessage("Please choose a valid start and end time.");
        return;
      }

      await API.post("/availability", {
        startTime: localStart.toISOString(),
        endTime: localEnd.toISOString(),
      });

      setMessage("Slot added successfully.");
      await fetchSlots();
    } catch (error: any) {
      console.error("Error adding slot:", error);
      setErrorMessage(error?.response?.data?.message || "Could not add slot.");
    } finally {
      setSlotActionLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setSlotActionLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      await API.delete(`/availability/${slotId}`);
      setMessage("Slot removed.");
      await fetchSlots();
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      setErrorMessage(error?.response?.data?.message || "Could not delete slot.");
    } finally {
      setSlotActionLoading(false);
    }
  };

  const runAutoSchedule = async () => {
    setAutoScheduling(true);
    setErrorMessage("");
    setMessage("");

    try {
      const payload = {
        fromDate: autoConfig.fromDate,
        toDate: autoConfig.toDate,
        slotDurationMinutes: Number(autoConfig.slotDurationMinutes),
        gapMinutes: Number(autoConfig.gapMinutes),
        timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
      };

      const { data } = await API.post("/availability/auto-schedule", payload);
      setMessage(
        `Auto scheduling complete. Created ${data?.createdCount || 0} slots, skipped ${data?.skippedConflicts || 0} conflicts.`
      );
      await fetchSlots();
    } catch (error: any) {
      console.error("Error auto scheduling:", error);
      setErrorMessage(error?.response?.data?.message || "Auto scheduling failed.");
    } finally {
      setAutoScheduling(false);
    }
  };

  const { leadingDays, daysInMonth, month, year } = buildMonthDays(monthCursor);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_16px_50px_-40px_rgba(6,182,212,0.7)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarDays className="h-5 w-5 text-cyan-600" />
            Availability Scheduler
          </h3>
          <button
            onClick={() => void fetchSlots()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Total Slots</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{monthStats.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Open Slots</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{monthStats.open}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Booked Slots</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{monthStats.booked}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_16px_50px_-40px_rgba(6,182,212,0.7)]">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-base font-bold text-slate-900">Automatic Scheduling</h4>
          <WandSparkles className="h-5 w-5 text-cyan-600" />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Generate slots automatically using your weekly availability and preferred slot duration.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            type="date"
            value={autoConfig.fromDate}
            onChange={(e) => setAutoConfig((prev) => ({ ...prev, fromDate: e.target.value }))}
            className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
          <input
            type="date"
            value={autoConfig.toDate}
            onChange={(e) => setAutoConfig((prev) => ({ ...prev, toDate: e.target.value }))}
            className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
          <input
            type="number"
            min="15"
            max="360"
            step="15"
            value={autoConfig.slotDurationMinutes}
            onChange={(e) =>
              setAutoConfig((prev) => ({ ...prev, slotDurationMinutes: e.target.value }))
            }
            placeholder="Duration (minutes)"
            className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
          <input
            type="number"
            min="0"
            max="180"
            step="5"
            value={autoConfig.gapMinutes}
            onChange={(e) => setAutoConfig((prev) => ({ ...prev, gapMinutes: e.target.value }))}
            placeholder="Gap (minutes)"
            className="rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <button
          onClick={() => void runAutoSchedule()}
          disabled={autoScheduling}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
        >
          <WandSparkles className="h-4 w-4" />
          {autoScheduling ? "Generating..." : "Auto Schedule Slots"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_16px_50px_-40px_rgba(6,182,212,0.7)]">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900">Calendar</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMonthCursor(new Date(year, month - 1, 1))}
                className="rounded-md border border-cyan-200 px-2 py-1 text-sm text-cyan-700 hover:bg-cyan-50"
              >
                Prev
              </button>
              <p className="text-sm font-semibold text-slate-700">
                {monthCursor.toLocaleDateString([], { month: "long", year: "numeric" })}
              </p>
              <button
                onClick={() => setMonthCursor(new Date(year, month + 1, 1))}
                className="rounded-md border border-cyan-200 px-2 py-1 text-sm text-cyan-700 hover:bg-cyan-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingDays }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20 rounded-md bg-slate-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNumber = index + 1;
              const dayDate = new Date(year, month, dayNumber);
              const dayKey = toDateKey(dayDate);
              const daySlots = slotsByDate[dayKey] || [];
              const bookedCount = daySlots.filter((slot) => slot.isBooked).length;
              const isSelected = selectedDate === dayKey;

              return (
                <button
                  key={dayKey}
                  onClick={() => setSelectedDate(dayKey)}
                  className={`h-20 rounded-md border p-2 text-left transition ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-cyan-100 bg-white hover:border-cyan-300 hover:bg-cyan-50/60"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-800">{dayNumber}</p>
                  <p className="mt-1 text-[11px] text-emerald-600">{daySlots.length - bookedCount} open</p>
                  <p className="text-[11px] text-amber-600">{bookedCount} booked</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_16px_50px_-40px_rgba(6,182,212,0.7)]">
          <h4 className="text-base font-bold text-slate-900">Create Slot</h4>
          <p className="mt-1 text-sm text-slate-600">Selected date: {selectedDate}</p>

          <div className="mt-4 space-y-3">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-cyan-100 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
            <button
              onClick={() => void handleAddSlot()}
              disabled={slotActionLoading}
              className="w-full rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
            >
              {slotActionLoading ? "Saving..." : "Add Slot"}
            </button>
          </div>

          <div className="mt-5">
            <h5 className="text-sm font-semibold text-slate-800">Slots on {selectedDate}</h5>
            {selectedDateSlots.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No slots for this day.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {selectedDateSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`rounded-lg border p-3 ${
                      slot.isBooked
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                        <Clock3 className="h-4 w-4 text-cyan-600" />
                        {toRangeLabel(slot.startTime, slot.endTime)}
                      </p>
                      {!slot.isBooked && (
                        <button
                          onClick={() => void handleDeleteSlot(slot._id)}
                          disabled={slotActionLoading}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    {slot.isBooked ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Booked by {slot.bookedBy?.name || slot.bookedBy?.email || "Client"}{" "}
                        {slot.job?.title ? `for "${slot.job.title}"` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-emerald-700">Available</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading availability...</p>}
      {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
      {errorMessage && <p className="text-sm font-medium text-rose-600">{errorMessage}</p>}
    </div>
  );
};

export default AvailabilityManager;
