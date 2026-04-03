import { useState, useEffect } from "react";
import API from "../../services/api";

// Slot type
interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Props type
interface AvailabilityManagerProps {
  freelancerId: string;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ freelancerId }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const fetchSlots = async () => {
    try {
      const { data } = await API.get<Slot[]>(`/availability/${freelancerId}`);
      setSlots(data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const addSlot = async () => {
    try {
      await API.post("/availability", { startTime, endTime });
      setStartTime("");
      setEndTime("");
      fetchSlots();
    } catch (error) {
      console.error("Error adding slot:", error);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [freelancerId]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3 className="text-xl mb-2">Manage Availability</h3>

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="p-2 mb-2 w-full bg-gray-800"
      />

      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="p-2 mb-2 w-full bg-gray-800"
      />

      <button onClick={addSlot} className="bg-green-600 px-4 py-2 rounded mb-4">
        Add Slot
      </button>

      <h4 className="mb-2">Existing Slots</h4>
      <ul>
        {slots.map((slot) => (
          <li
            key={slot._id}
            className={`p-2 mb-1 rounded ${slot.isBooked ? "bg-red-600" : "bg-gray-800"}`}
          >
            {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}{" "}
            {slot.isBooked && "(Booked)"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AvailabilityManager;