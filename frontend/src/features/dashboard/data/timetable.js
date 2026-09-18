// src/features/dashboard/data/timetable.js

export const TODAY_CLASSES = [
  {
    id: "c1",
    code: "CS 302",
    name: "Operating Systems",
    professor: "Dr. Meera Rao",
    room: "B-204",
    start: "09:00",
    end: "10:00",
    status: "done",
    attendance: "present",
  },
  {
    id: "c2",
    code: "CS 301",
    name: "Design & Analysis of Algorithms",
    professor: "Dr. Anurag Sharma",
    room: "B-201",
    start: "10:15",
    end: "11:15",
    status: "done",
    attendance: "present",
  },
  {
    id: "c3",
    code: "CS 305",
    name: "Database Management Systems",
    professor: "Prof. Kavita Singh",
    room: "B-102",
    start: "11:30",
    end: "12:30",
    status: "done",
    attendance: "absent",
  },
  {
    id: "c4",
    code: "CS 302",
    name: "Operating Systems Lab",
    professor: "Dr. Meera Rao",
    room: "Computer Centre",
    start: "14:00",
    end: "16:00",
    status: "next",
    attendance: null,
  },
  {
    id: "c5",
    code: "CS 305",
    name: "DBMS Lab",
    professor: "Prof. Kavita Singh",
    room: "Computer Centre",
    start: "16:15",
    end: "17:15",
    status: "upcoming",
    attendance: null,
  },
];

export const DEADLINES = [
  { id: "d1", title: "DSA Assignment 3", subject: "CS 301", due: "Tomorrow, 5:00 PM", urgency: "high" },
  { id: "d2", title: "OS Lab Record Submission", subject: "CS 302", due: "In 2 days", urgency: "medium" },
  { id: "d3", title: "DBMS Mini Project Proposal", subject: "CS 305", due: "Friday", urgency: "low" },
];

export const SUBJECT_ATTENDANCE = [
  { subject: "CS 301 – DAA", percent: 76, total: 42, attended: 32, alert: true },
  { subject: "CS 302 – OS", percent: 88, total: 40, attended: 35, alert: false },
  { subject: "CS 305 – DBMS", percent: 84, total: 38, attended: 32, alert: false },
  { subject: "CS 306 – Networks", percent: 90, total: 30, attended: 27, alert: false },
  { subject: "CS 307 – SE", percent: 78, total: 32, attended: 25, alert: false },
];