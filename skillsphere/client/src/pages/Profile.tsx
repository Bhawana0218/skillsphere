import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Skill Type
interface Skill {
  name: string;
  level: string;
}

//  Profile Type
interface ProfileType {
  bio: string;
  skills: Skill[];
  hourlyRate: string;
  experience: string[];
}

function Profile() {
  const [profile, setProfile] = useState<ProfileType>({
    bio: "",
    skills: [],
    hourlyRate: "",
    experience: [],
  });

  //  Skill input states
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");

  useEffect(() => {
    fetchProfile();
  }, []);

  //  Fetch Profile
  const fetchProfile = async () => {
    try {
      const { data } = await API.get<ProfileType>("/profile/me");
      if (data) setProfile(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await API.post("/profile", profile);
      toast.success("Profile saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile.");
    }
  };

  //  Input Handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  //  Add Skill
  const addSkill = () => {
    if (!skillName.trim()) return;

    setProfile({
      ...profile,
      skills: [
        ...profile.skills,
        { name: skillName, level: skillLevel },
      ],
    });

    setSkillName("");
    setSkillLevel("Beginner");
  };

  //  Remove Skill
  const removeSkill = (index: number) => {
    const updatedSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({ ...profile, skills: updatedSkills });
  };

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl">Your Profile</h1>
          <p className="mt-1 text-sm text-white/70">
            Manage your public profile and account security.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/settings/security"
            className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-400/20 hover:bg-cyan-500/25"
          >
            Security (2FA)
          </Link>
          <Link
            to="/resend-verification"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
          >
            Resend verification
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Account status</div>
          <div className="mt-2 text-sm text-white/70">
            Email verification and security settings help protect your payments and reputation.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/verify-email"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Verify email
            </Link>
            <Link
              to="/forgot-password"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Reset password
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Security recommendations</div>
          <ul className="mt-2 list-inside list-disc text-sm text-white/70">
            <li>Enable 2FA for login protection</li>
            <li>Verify email for trusted collaboration</li>
            <li>Use a strong password and rotate periodically</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BIO */}
        <textarea
          name="bio"
          placeholder="Bio"
          className="w-full p-3 bg-gray-800 rounded"
          value={profile.bio}
          onChange={handleChange}
        />

        {/* HOURLY RATE */}
        <input
          name="hourlyRate"
          placeholder="Hourly Rate"
          className="w-full p-3 bg-gray-800 rounded"
          value={profile.hourlyRate}
          onChange={handleChange}
        />

        {/* SKILLS SECTION */}
        <div>
          <h2 className="text-xl mb-2">Skills</h2>

          <div className="flex gap-2 mb-3">
            <input
              placeholder="Skill name"
              className="p-2 bg-gray-800 rounded w-full"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />

            <select
              className="p-2 bg-gray-800 rounded"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>

            <button
              type="button"
              onClick={addSkill}
              className="bg-green-600 px-4 rounded"
            >
              Add
            </button>
          </div>

          {/* Skill List */}
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-gray-700 px-3 py-1 rounded flex items-center gap-2"
              >
                <span>
                  {skill.name} - {skill.level}
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button className="bg-blue-600 px-6 py-2 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;