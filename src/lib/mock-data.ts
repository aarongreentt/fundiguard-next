export type Job = {
  id: string;
  title: string;
  category: string;
  location: string;
  budgetRange: string;
  status: "open" | "assigned" | "in_progress" | "completed";
};

export const mockJobs: Job[] = [
  {
    id: "job_1",
    title: "Fix leaking kitchen tap",
    category: "Plumbing",
    location: "Nairobi, Westlands",
    budgetRange: "KSh 1,500 - 3,000",
    status: "open",
  },
  {
    id: "job_2",
    title: "Install wall sockets (2 rooms)",
    category: "Electrical",
    location: "Nairobi, Kilimani",
    budgetRange: "KSh 4,000 - 7,000",
    status: "open",
  },
  {
    id: "job_3",
    title: "Paint 1-bedroom apartment",
    category: "Painting",
    location: "Nairobi, Ruaka",
    budgetRange: "KSh 15,000 - 25,000",
    status: "assigned",
  },
];
