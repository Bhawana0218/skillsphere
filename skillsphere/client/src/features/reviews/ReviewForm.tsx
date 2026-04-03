import { useState } from "react";
import type { ChangeEvent } from "react";
import API from "../../services/api";

// Props Type
interface ReviewFormProps {
  jobId: string;
  freelancerId: string;
}

function ReviewForm({ jobId, freelancerId }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const submitReview = async () => {
    try {
      await API.post("/reviews", {
        jobId,
        freelancerId,
        rating,
        comment,
      });

      alert("Review submitted!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded">
      <h3 className="text-white mb-2">Leave a Review</h3>

      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setRating(Number(e.target.value))
        }
        className="w-full mb-2 p-2 bg-gray-700 text-white"
      />

      <textarea
        placeholder="Write feedback..."
        value={comment}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setComment(e.target.value)
        }
        className="w-full p-2 bg-gray-700 text-white"
      />

      <button
        onClick={submitReview}
        className="mt-2 bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
      >
        Submit Review
      </button>
    </div>
  );
}

export default ReviewForm;