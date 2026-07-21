# Implementation Plan: Curriculum & Syllabus Integration

## Goal Description
Move the action buttons in the Teacher's Curriculum page into the hero section as icons (with popups where necessary), and build out the Syllabus feature for both Teachers and Students.

## Proposed Changes

### 1. Teacher Curriculum Page (`teacher-dashboard/courses/[courseId]/curriculum/page.tsx`)
- **Hero Section UI Update:** 
  Move the existing controls (Subjects, Add Module, Add Lesson, Search) into the right side of the hero section using icons.
  - 🔍 **Search Icon:** Clicking opens a popup search bar (similar to the Student Recorded Classes page).
  - 📚 **Subjects Icon:** Clicking directly opens the existing Subjects modal.
  - 📁 **Add Module Icon:** Clicking directly opens the Add Module modal.
  - 🎥 **Add Lesson Icon:** Clicking directly opens the Add Lesson modal.
  - 📝 **Edit Syllabus Icon (New):** Clicking opens a new "Syllabus Settings" modal.

### 2. Syllabus Settings Modal (Teacher Dashboard)
- Create a new modal for teachers to add extra syllabus information.
- Fields will include:
  - **What you will learn (Learning Objectives):** A text area to write bullet points.
  - **Requirements (Prerequisites):** A text area for course prerequisites.
  - **Grading & Certification:** Information about how the course is evaluated.
- This data will be saved to the `courses` document in Firestore.

### 3. Student Syllabus Page (`dashboard/courses/[courseId]/syllabus/page.tsx`)
- Build a beautiful, read-only presentation of the course syllabus.
- **Section 1: Overview & Objectives:** Display the text added by the teacher (What you will learn, Requirements).
- **Section 2: Course Curriculum (Accordion):** Fetch all modules and lessons from the database and display them in a structured Accordion format. Students can click a module to expand and see the list of lessons inside it, without playing the videos.

## User Review Required
> [!IMPORTANT]
> Is the proposed "Syllabus Settings Modal" (with fields for Learning Objectives, Prerequisites, etc.) aligned with what you had in mind for the teacher's syllabus option? Or did you just want the Curriculum (Modules & Lessons) to be displayed on the student syllabus page without any extra text fields?
