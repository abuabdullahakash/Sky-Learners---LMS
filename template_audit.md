# Course Landing Page Templates Audit

This is a comprehensive audit of all the frontend course landing page templates available in the system, detailing the specific sections and components they render.

## 1. Default Template (`DefaultTemplate.tsx`)
**Used for:** Any category not explicitly mapped (fallback template).
**Vibe:** Standard, clean, and basic layout.
**Sections Included:**
- **Hero Section:** Course Title, Subtitle, Rating, Enrolled Students, Duration, Category.
- **Slider/Cover Image:** Background slider or single cover image.
- **Intro Video Modal:** Floating Play button.
- **Description:** Detailed Description text block.
- **Learning Outcomes:** (`LearningOutcomes` component).
- **Target Audience:** (`TargetAudience` component).
- **Curriculum:** (`CourseCurriculum` component).
- **Instructors:** 3D Perspective Carousel (`PerspectiveCarousel`).
- **Gallery:** (`galleryImages` grid).
- **Testimonials:** (`CourseTestimonials` component).
- **FAQs:** Accordion-style FAQ section.
- **Sticky Pricing Card:** Floating price card on the right side.

---

## 2. School Template (`SchoolTemplate.tsx`)
**Used for:** `primary`, `high_school`.
**Vibe:** Kids-friendly, parent-focused, soft colors, uses "Heart" icons.
**Sections Included:**
- **Hero Section:** Title, Subtitle, Stats.
- **Slider/Cover Image:** Background with slider dots.
- **Intro Video Modal:** Play button.
- **Message for Parents (অভিভাবকদের উদ্দেশ্যে):** A dedicated section rendering `course.parentMessage` with a soft blue background and Heart icon. *(Unique to this template)*
- **Course Features:** (`CourseFeatures` component).
- **Description:** Boxed description block.
- **Learning Outcomes:** (`LearningOutcomes` component).
- **Target Audience:** (`TargetAudience` component).
- **Curriculum:** (`CourseCurriculum` component).
- **Study Routine & Syllabus:** Download button for `course.studyRoutineUrl` with a distinct UI. *(Unique to School & Admission templates)*
- **Instructors:** 3D Perspective Carousel.
- **Gallery:** Image grid.
- **Testimonials:** (`CourseTestimonials` component).
- **FAQs:** Accordion-style FAQ section.
- **Sticky Pricing Card:** Right sidebar.

---

## 3. Skill Template (Mature Academic) (`SkillTemplate.tsx`)
**Used for:** `intermediate`, `honours`, `masters`, `skills`.
**Vibe:** Professional, career-focused, mature, uses "Briefcase" and "Award" icons.
**Sections Included:**
- **Hero Section:** Title, Subtitle, Stats.
- **Slider/Cover Image:** Background with slider dots.
- **Intro Video Modal:** Play button.
- **Career Guidance / Portfolio (ক্যারিয়ার গাইডেন্স):** A dedicated section rendering `course.careerMessage` with an emerald/green background. *(Unique to this template)*
- **Course Features:** (`CourseFeatures` component).
- **Description:** Boxed description block with a sleek border style.
- **Learning Outcomes:** (`LearningOutcomes` component).
- **Target Audience:** (`TargetAudience` component).
- **Curriculum:** (`CourseCurriculum` component).
- **Instructors:** 3D Perspective Carousel.
- **Gallery:** Image grid.
- **Testimonials:** (`CourseTestimonials` component).
- **FAQs:** Accordion-style FAQ section.
- **Sticky Pricing Card:** Right sidebar.

---

## 4. Admission Template (`AdmissionTemplate.tsx`)
**Used for:** `admission`.
**Vibe:** Aggressive, target-oriented, competitive, uses "Target" and "Trophy" icons, red/orange color schemes.
**Sections Included:**
- **Hero Section:** Title, Subtitle, Stats.
- **Slider/Cover Image:** Background with slider dots.
- **Intro Video Modal:** Play button.
- **Success Focus (স্পেশাল ফোকাস / নিশ্চয়তা):** A dedicated section rendering `course.successMessage` with a bold red background and Target icon. *(Unique to this template)*
- **Course Features:** (`CourseFeatures` component).
- **Description:** Boxed description block with red accents.
- **Learning Outcomes:** (`LearningOutcomes` component).
- **Target Audience:** (`TargetAudience` component).
- **Curriculum:** (`CourseCurriculum` component).
- **Study Routine & Exam Calendar:** Red-themed download block for `course.studyRoutineUrl` (e.g., "স্টাডি রুটিন ও এক্সাম ক্যালেন্ডার ডাউনলোড করুন").
- **Instructors:** 3D Perspective Carousel.
- **Gallery:** Image grid.
- **Testimonials:** (`CourseTestimonials` component).
- **FAQs:** Accordion-style FAQ section.
- **Sticky Pricing Card:** Right sidebar.
