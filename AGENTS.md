<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router Architecture & Standards
This version uses Next.js App Router with Internationalization (`[locale]` routing), Firebase Firestore & Auth, Tailwind CSS, and Lucide icons. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🏛️ SkyLearners Architecture & Development Guidelines

This LMS platform is architected around a **Dual-Mode System** with **Clean SEO URLs**:

---

## 🌐 1. Platform Modes & Categorization

### A. Marketplace Mode (গ্লোবাল মার্কেটপ্লেস)
* **Target Audience:** Organic Google/Social visitors, guests, and students who haven't selected a focused teacher academy.
* **Scope:** Displays nationwide courses from all teachers, coaching institutions, platform notices, and global FAQs.
* **Core Pages:**
  - `Home` (`/`)
  - `Courses Catalog` (`/courses`)
  - `About Platform` (`/about`)
  - *(Any future marketplace page added here only impacts Marketplace mode)*

### B. Teacher Storefront Mode (শিক্ষকের নিজস্ব কাস্টম একাডেমি)
* **Target Audience:** The logged-in teacher, visitors arriving via a teacher's referral/share link, and enrolled students who set this teacher as their "Focused Academy" (`preferredTeacherId`).
* **Scope:** Displays only that teacher's branded pages, bio, video intro, custom value cards, testimonials, and courses.
* **Customization:** Fully customizable by the teacher via **Website Builder** (`/teacher-dashboard/home-builder`).
* **Core Pages:**
  - `Teacher Home` (Rendered via `<TeacherStorefrontView />` or `/teachers/[slug]`)
  - `Teacher Courses` (`/courses` filtered by `teacherId`)
  - `Teacher About` (`/about` with teacher's custom bio/values)
  - *(Any future teacher page added here connects to Teacher Storefront & Website Builder)*

---

## 🔗 2. Clean URL & SEO Standards (Strict)

1. **Clean & Human-Readable Slugs:**
   - Always use clean slugs for courses: `/courses/[courseSlug]` (never messy database IDs in user-facing URLs).
   - Always use clean slugs for teacher academies: `/teachers/[teacherSlug]`.
2. **SEO & Canonical Tags:**
   - Search engines crawl clean URLs (`/`, `/courses`, `/about`, `/teachers/[slug]`, `/courses/[slug]`).
   - Referral parameters (like `?ref=...`) must maintain canonical tags pointing to the clean canonical URLs.
3. **No Cluttered URLs:** Avoid unnecessary parameters or exposed Firebase document IDs in public navigation.

---

## 🛠️ 3. Rules for Adding New Pages / Features

Whenever developing or updating the website:

### When User Requests a **Marketplace Page**:
* Register the page under the **Marketplace Navigation**.
* Ensure it only renders in Marketplace mode and does not alter or conflict with individual Teacher Storefronts.
* Make the route clean, responsive, and SEO-friendly.

### When User Requests a **Teacher Site Page**:
* Register the page under the **Teacher Storefront Navigation**.
* Integrate the page/section data with the **Teacher Website Builder** (`/teacher-dashboard/home-builder`) so the teacher can edit its content.
* Ensure the page loads dynamically for visitors in Teacher Mode (`referralTeacherId` / `preferredTeacherId` / logged-in teacher).
