import { useEffect, useState } from "react";
import API from "../../services/api";

// Review Type
interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
  };
}

// Props Type
interface ReviewListProps {
  freelancerId: string;
}

function ReviewList({ freelancerId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, [freelancerId]);

  const fetchReviews = async () => {
    try {
      const { data } = await API.get<Review[]>(`/reviews/${freelancerId}`);
      setReviews(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet</p>
      ) : (
        reviews.map((r) => (
          <div key={r._id} className="bg-gray-800 p-3 mb-2 rounded">
            <h4 className="text-white font-semibold">{r.reviewer.name}</h4>
            <p className="text-yellow-400">⭐ {r.rating}</p>
            <p className="text-gray-300">{r.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewList;