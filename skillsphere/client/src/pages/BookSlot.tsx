import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import API from "../services/api";

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const pad = (value: number) => String(value).padStart(2, "0");

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toTimeLabel = (isoValue: string) =>
  new Date(isoValue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const BookSlot = () => {
  const { freelancerId, jobId } = useParams<{
    freelancerId: string;
    jobId: string;
  }>();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSlots = async () => {
    if (!freelancerId) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const nowIso = new Date().toISOString();
      const { data } = await API.get<Slot[]>(
        `/availability/${freelancerId}?includeBooked=false&startDate=${encodeURIComponent(nowIso)}`
      );
      const normalizedSlots = Array.isArray(data) ? data.filter((slot) => !slot.isBooked) : [];
      setSlots(normalizedSlots);
      if (!selectedDate && normalizedSlots.length > 0) {
        setSelectedDate(toDateKey(new Date(normalizedSlots[0].startTime)));
      }
    } catch (error: any) {
      console.error("Error fetching slots:", error);
      setErrorMessage("Unable to fetch available slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSlots();
  }, [freelancerId]);

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      const key = toDateKey(new Date(slot.startTime));
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const availableDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const selectedDateSlots = useMemo(() => {
    const daySlots = slotsByDate[selectedDate] || [];
    return [...daySlots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [selectedDate, slotsByDate]);

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const book = async (slotId: string) => {
    setBookingSlotId(slotId);
    setMessage("");
    setErrorMessage("");

    try {
      await API.post("/availability/book", { slotId, jobId });
      setMessage("Slot booked successfully.");
      await fetchSlots();
    } catch (error: any) {
      console.error("Error booking slot:", error);
      setErrorMessage(error?.response?.data?.message || "Failed to book slot.");
    } finally {
      setBookingSlotId("");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cyan-50 to-cyan-100 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(6,182,212,0.7)]">
          <h1 className="inline-flex items-center gap-2 text-2xl font-black text-slate-900">
            <CalendarClock className="h-6 w-6 text-cyan-600" />
            Book Freelancer Slot
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a date and reserve an available session for your project.
          </p>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(6,182,212,0.7)]">
          <h2 className="text-base font-bold text-slate-900">Available Dates</h2>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading available dates...</p>
          ) : availableDates.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No available slots right now.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {availableDates.map((dateKey) => (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedDate === dateKey
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                  }`}
                >
                  {new Date(`${dateKey}T12:00:00`).toLocaleDateString([], {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(6,182,212,0.7)]">
          <h2 className="text-base font-bold text-slate-900">
            {selectedDate
              ? `Available Times on ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString()}`
              : "Available Times"}
          </h2>
          {selectedDateSlots.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No open slots for this date.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedDateSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3"
                >
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Clock3 className="h-4 w-4 text-cyan-600" />
                    {toTimeLabel(slot.startTime)} - {toTimeLabel(slot.endTime)}
                  </p>
                  <button
                    onClick={() => void book(slot._id)}
                    disabled={bookingSlotId === slot._id}
                    className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
                  >
                    {bookingSlotId === slot._id ? "Booking..." : "Book Slot"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {message && (
          <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </p>
        )}
        {errorMessage && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookSlot;
