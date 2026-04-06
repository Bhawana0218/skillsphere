import express from "express";

const router = express.Router();

const defaultFaqs = [
  {
    question: "How does SkillSphere connect clients with freelancers?",
    answer:
      "SkillSphere matches project requirements with freelancer skills, availability, and past performance.",
  },
  {
    question: "How are payments protected?",
    answer:
      "Payments are handled through milestone-based workflows so both clients and freelancers stay protected.",
  },
  {
    question: "Can I work with local freelancers only?",
    answer:
      "Yes. You can discover nearby freelancers using location filters and local discovery features.",
  },
  {
    question: "How quickly can I hire someone?",
    answer:
      "Most clients receive qualified proposals shortly after posting a project with clear requirements.",
  },
  {
    question: "Can freelancers build a public profile?",
    answer:
      "Yes. Freelancers can showcase skills, portfolio items, ratings, and completed work history.",
  },
];

router.get("/", async (_req, res) => {
  res.json(defaultFaqs);
});

export default router;
