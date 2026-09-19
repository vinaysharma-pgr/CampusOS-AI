import Exam from "../models/Exam.js";
import ExamResult from "../models/ExamResult.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

async function loadExamOrFail(examId) {
  const exam = await Exam.findById(examId);
  if (!exam || !exam.isActive) throw ApiError.notFound("Exam not found");
  return exam;
}

// Faculty view: list all results (or blanks) for an exam
export async function listResultsForExam(examId, user) {
  const exam = await loadExamOrFail(examId);

  // faculty can only view exams in their department
  if (user.role === "faculty" && user.department && exam.department !== user.department) {
    throw ApiError.forbidden("You can only view exams in your department");
  }

  // pull students in the exam's group
  const studentQuery = {
    role: "student",
    isActive: true,
    department: exam.department,
    semester: String(exam.semester),
  };
  if (exam.section) studentQuery.section = exam.section;

  const students = await User.find(studentQuery)
    .select("_id name email rollNo")
    .sort({ name: 1 })
    .lean();

  const existing = await ExamResult.find({ examId, isActive: true }).lean();
  const byStudent = new Map(existing.map((r) => [String(r.studentId), r]));

  const rows = students.map((s) => {
    const r = byStudent.get(String(s._id));
    return {
      studentId: s._id,
      name: s.name,
      rollNo: s.rollNo || "",
      email: s.email,
      marksObtained: r ? r.marksObtained : 0,
      isAbsent: r ? r.isAbsent : false,
      remarks: r ? r.remarks : "",
      resultId: r ? r._id : null,
    };
  });

  return {
    exam,
    students: rows,
    counts: {
      total: rows.length,
      entered: rows.filter((r) => r.resultId).length,
      absent: rows.filter((r) => r.isAbsent).length,
    },
  };
}

// Faculty/admin: bulk upsert results for many students in one exam
export async function bulkUpsertResults(examId, results, user) {
  const exam = await loadExamOrFail(examId);

  if (user.role === "faculty" && user.department && exam.department !== user.department) {
    throw ApiError.forbidden("You can only enter marks for exams in your department");
  }
  if (!Array.isArray(results) || results.length === 0) {
    throw ApiError.badRequest("results array is required");
  }
  if (exam.isPublished) {
    throw ApiError.badRequest("Results already published. Unpublish first to edit.");
  }

  const ops = [];
  for (const r of results) {
    if (!r.studentId) continue;

    let marks = Number(r.marksObtained) || 0;
    if (marks < 0) marks = 0;
    if (marks > exam.maxMarks) marks = exam.maxMarks;

    ops.push({
      updateOne: {
        filter: { examId, studentId: r.studentId },
        update: {
          $set: {
            examId,
            studentId: r.studentId,
            marksObtained: marks,
            isAbsent: !!r.isAbsent,
            remarks: (r.remarks || "").toString().slice(0, 500),
            enteredBy: user._id,
            enteredByName: user.name || "",
            isActive: true,
          },
          $setOnInsert: { publishedAt: null },
        },
        upsert: true,
      },
    });
  }

  if (ops.length === 0) throw ApiError.badRequest("No valid student rows to save");

  const res = await ExamResult.bulkWrite(ops, { ordered: false });
  return {
    matched: res.matchedCount || 0,
    upserted: res.upsertedCount || 0,
    modified: res.modifiedCount || 0,
  };
}

// Admin: publish / unpublish
export async function publishResults(examId, publish, user) {
  const exam = await loadExamOrFail(examId);
  exam.isPublished = !!publish;
  await exam.save();

  if (publish) {
    await ExamResult.updateMany(
      { examId, isActive: true, publishedAt: null },
      { publishedAt: new Date() }
    );
  } else {
    await ExamResult.updateMany({ examId }, { publishedAt: null });
  }

  return { examId, isPublished: exam.isPublished };
}

// Student: my published results
export async function getMyResults(studentId) {
  const results = await ExamResult.find({ studentId, isActive: true, publishedAt: { $ne: null } })
    .sort({ createdAt: -1 })
    .lean();

  if (results.length === 0) return { results: [], byCourse: [], summary: null };

  const examIds = results.map((r) => r.examId);
  const exams = await Exam.find({ _id: { $in: examIds } }).lean();
  const byId = new Map(exams.map((e) => [String(e._id), e]));

  const enriched = results
    .map((r) => {
      const ex = byId.get(String(r.examId));
      if (!ex) return null;
      const pct = ex.maxMarks > 0 ? Math.round((r.marksObtained / ex.maxMarks) * 100) : 0;
      const passed = !r.isAbsent && r.marksObtained >= ex.passingMarks;
      return {
        resultId: r._id,
        examId: ex._id,
        title: ex.title,
        courseCode: ex.courseCode,
        courseName: ex.courseName,
        examType: ex.examType,
        date: ex.date,
        marksObtained: r.marksObtained,
        maxMarks: ex.maxMarks,
        passingMarks: ex.passingMarks,
        percentage: pct,
        passed,
        isAbsent: r.isAbsent,
        remarks: r.remarks,
      };
    })
    .filter(Boolean);

  // aggregate per course
  const byCourseMap = new Map();
  for (const r of enriched) {
    const key = r.courseCode;
    if (!byCourseMap.has(key)) {
      byCourseMap.set(key, {
        courseCode: r.courseCode,
        courseName: r.courseName,
        exams: [],
        totalObtained: 0,
        totalMax: 0,
        passed: 0,
      });
    }
    const c = byCourseMap.get(key);
    c.exams.push(r);
    c.totalObtained += r.marksObtained;
    c.totalMax += r.maxMarks;
    if (r.passed) c.passed++;
  }

  const byCourse = Array.from(byCourseMap.values()).map((c) => ({
    ...c,
    percentage: c.totalMax > 0 ? Math.round((c.totalObtained / c.totalMax) * 100) : 0,
  }));

  const totalObtained = enriched.reduce((s, r) => s + r.marksObtained, 0);
  const totalMax = enriched.reduce((s, r) => s + r.maxMarks, 0);

  const summary = {
    examsTaken: enriched.length,
    coursesCount: byCourse.length,
    totalObtained,
    totalMax,
    overallPercentage: totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0,
    passedCount: enriched.filter((r) => r.passed).length,
  };

  return { results: enriched, byCourse, summary };
}

// Admin/HOD: stats per exam
export async function getClassStats(examId) {
  const exam = await loadExamOrFail(examId);
  const results = await ExamResult.find({ examId, isActive: true }).lean();

  const entered = results.filter((r) => !r.isAbsent);
  const absent = results.filter((r) => r.isAbsent);
  const passed = entered.filter((r) => r.marksObtained >= exam.passingMarks);
  const failed = entered.filter((r) => r.marksObtained < exam.passingMarks);

  const marks = entered.map((r) => r.marksObtained);
  const avg = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
  const max = marks.length ? Math.max(...marks) : 0;
  const min = marks.length ? Math.min(...marks) : 0;

  const buckets = [
    { label: "0-39", min: 0, max: 39, count: 0 },
    { label: "40-49", min: 40, max: 49, count: 0 },
    { label: "50-59", min: 50, max: 59, count: 0 },
    { label: "60-69", min: 60, max: 69, count: 0 },
    { label: "70-79", min: 70, max: 79, count: 0 },
    { label: "80-89", min: 80, max: 89, count: 0 },
    { label: "90-100", min: 90, max: 100, count: 0 },
  ];
  for (const r of entered) {
    const pct = exam.maxMarks > 0 ? (r.marksObtained / exam.maxMarks) * 100 : 0;
    const b = buckets.find((x) => pct >= x.min && pct <= x.max + 0.99);
    if (b) b.count++;
  }

  return {
    exam,
    stats: {
      totalStudents: entered.length + absent.length,
      entered: entered.length,
      absent: absent.length,
      passed: passed.length,
      failed: failed.length,
      passPercentage: entered.length ? Math.round((passed.length / entered.length) * 100) : 0,
      average: avg,
      max,
      min,
      buckets,
    },
  };
}
