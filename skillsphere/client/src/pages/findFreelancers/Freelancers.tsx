import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import API from "../../services/api";

interface Profile {
  _id: string;
  title?: string;
  hourlyRate: number | string;
  location?: string;
  rating?: number;
  experienceCount?: number;
  skills?: string[];
  name?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface Filters {
  skill: string;
  location: string;
  minRate: string;
  maxRate: string;
  minRating: string;
  maxRating: string;
  minExperience: string;
  maxExperience: string;
}

const defaultFilters: Filters = {
  skill: "",
  location: "",
  minRate: "",
  maxRate: "",
  minRating: "",
  maxRating: "",
  minExperience: "",
  maxExperience: "",
};

const fieldLabels: Record<keyof Filters, string> = {
  skill: "Skill",
  location: "Location",
  minRate: "Min Rate",
  maxRate: "Max Rate",
  minRating: "Min Rating",
  maxRating: "Max Rating",
  minExperience: "Min Experience",
  maxExperience: "Max Experience",
};

export default function Freelancers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchEngine, setSearchEngine] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const activeFilters = useMemo(
    () =>
      (Object.entries(filters) as [keyof Filters, string][])
        .filter(([, value]) => value.trim() !== "")
        .map(([key, value]) => `${fieldLabels[key]}: ${value}`),
    [filters]
  );

  const getDisplayName = (profile: Profile) => {
    const nestedName = profile.user?.name?.trim();
    if (nestedName) return nestedName;

    const topLevelName = profile.name?.trim();
    if (topLevelName) return topLevelName;

    return "Freelancer";
  };

  const buildSearchQuery = (inputFilters: Filters) => {
    const query = new URLSearchParams();

    (Object.entries(inputFilters) as [keyof Filters, string][]).forEach(([key, value]) => {
      const trimmed = value.trim();
      if (trimmed) query.append(key, trimmed);
    });

    query.append("limit", "72");
    return query.toString();
  };

  const runSearch = async (inputFilters: Filters) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const query = buildSearchQuery(inputFilters);
      const response = await API.get<Profile[]>(`/profile/search?${query}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      setProfiles(Array.isArray(response.data) ? response.data : []);
      const backendEngine = response.headers["x-search-engine"];
      if (backendEngine === "mongodb-atlas-search") {
        setSearchEngine("MongoDB Atlas Search");
      } else if (backendEngine === "mongodb-query") {
        setSearchEngine("MongoDB Query Engine");
      } else {
        setSearchEngine("Connected to backend");
      }
    } catch (error) {
      console.error(error);
      setProfiles([]);
      setSearchEngine("");
      setErrorMessage("Search failed. Please try again.");
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    void runSearch(defaultFilters);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void runSearch(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    void runSearch(defaultFilters);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cyan-50 to-cyan-100 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-cyan-100 bg-white/95 p-6 shadow-[0_18px_60px_-34px_rgba(6,182,212,0.45)] md:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700">
                <Users className="h-4 w-4" />
                Advanced Search Engine
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Discover Top Freelancers with Precision
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
                Search by skill and location, then refine by price range, rating, and experience to find your ideal talent match.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                Search Backend
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {searchEngine || "Connecting..."}
              </p>
            </div>
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearchSubmit}
          className="mt-6 rounded-3xl border border-cyan-100 bg-white p-6 shadow-[0_18px_60px_-38px_rgba(6,182,212,0.42)] md:p-8"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
              <SlidersHorizontal className="h-5 w-5 text-cyan-600" />
              Refine Search
            </h2>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {activeFilters.length} active filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              name="skill"
              placeholder="Skill (React, Node, UI/UX)"
              value={filters.skill}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              name="location"
              placeholder="Location (City, Region)"
              value={filters.location}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              name="minRate"
              placeholder="Min Rate (INR/hr)"
              value={filters.minRate}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              name="maxRate"
              placeholder="Max Rate (INR/hr)"
              value={filters.maxRate}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              name="minRating"
              placeholder="Min Rating (0-5)"
              value={filters.minRating}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              name="maxRating"
              placeholder="Max Rating (0-5)"
              value={filters.maxRating}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              name="minExperience"
              placeholder="Min Experience Entries"
              value={filters.minExperience}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <input
              type="number"
              min="0"
              name="maxExperience"
              placeholder="Max Experience Entries"
              value={filters.maxExperience}
              onChange={handleChange}
              className="rounded-xl border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {activeFilters.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Run Search"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-xl border border-cyan-200 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Reset Filters
            </button>
          </div>
        </motion.form>

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {loading ? "Searching..." : `${profiles.length} freelancers found`}
            </h3>
            {errorMessage && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                {errorMessage}
              </p>
            )}
          </div>

          {!loading && hasSearched && profiles.length === 0 ? (
            <div className="rounded-3xl border border-cyan-100 bg-white p-10 text-center shadow-[0_18px_60px_-40px_rgba(6,182,212,0.45)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
                <Search className="h-8 w-8 text-cyan-600" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-900">No matching freelancers</h4>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
                Try broadening your skill or location terms, or relax one of the price, rating, or experience filters.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {profiles.map((profile, index) => {
                const displayName = getDisplayName(profile);
                const hourlyRate = Number(profile.hourlyRate) || 0;
                const rating = Number(profile.rating) || 0;
                const experienceCount = Number(profile.experienceCount) || 0;
                const skills = Array.isArray(profile.skills) ? profile.skills : [];

                return (
                  <motion.article
                    key={profile._id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group rounded-3xl border border-cyan-100 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(6,182,212,0.6)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_-44px_rgba(6,182,212,0.6)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-700 text-sm font-bold uppercase text-white">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{displayName}</h4>
                          <p className="text-sm text-slate-500">{profile.title || "Freelancer"}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                          <Wallet className="h-3.5 w-3.5" />
                          Rate
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">INR {hourlyRate}/hr</p>
                      </div>
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          Experience
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{experienceCount} entries</p>
                      </div>
                    </div>

                    <div className="mt-4 min-h-6">
                      {profile.location ? (
                        <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-cyan-600" />
                          {profile.location}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">Location not shared</p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.length > 0 ? (
                        skills.slice(0, 6).map((skillName) => (
                          <span
                            key={`${profile._id}-${skillName}`}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700"
                          >
                            {skillName}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No skills listed</span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
