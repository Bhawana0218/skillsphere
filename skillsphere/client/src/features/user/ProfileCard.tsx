import type { FC } from "react";

// Skill Type
interface Skill {
  name: string;
  level: string;
}

// User Type
interface User {
  name: string;
}

// Profile Type
interface Profile {
  user: User;
  bio: string;
  skills: Skill[];
  hourlyRate: string;
}

// Props Type
interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold required:">{profile.user.name}</h2>

      <p className="text-gray-400 required:">{profile.bio}</p>

      {/* Skills */}
      <div className="mt-4">
        {profile.skills?.map((skill, i) => (
          <span
            key={i}
            className="bg-blue-600 px-3 py-1 mr-2 rounded"
          >
            {skill.name} ({skill.level})
          </span>
        ))}
      </div>

      {/* Rate */}
      <p className="mt-4 text-green-400">
        ₹{profile.hourlyRate}/hr
      </p>
    </div>
  );
};

export default ProfileCard;