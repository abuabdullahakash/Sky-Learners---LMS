import { Firestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Normalizes category into a clean URL-friendly category slug.
 * e.g., 'intermediate' -> 'hsc', 'high_school' -> 'ssc', 'primary' -> 'primary'
 */
export function generateCategorySlug(category?: string): string {
  if (!category) return 'general';
  const c = category.toLowerCase().trim();
  if (c === 'intermediate' || c === 'hsc') return 'hsc';
  if (c === 'high_school' || c === 'ssc') return 'ssc';
  if (c === 'primary') return 'primary';
  if (c === 'admission') return 'admission';
  if (c === 'honours') return 'honours';
  if (c === 'masters') return 'masters';
  if (c === 'skills' || c === 'programming' || c === 'design' || c === 'language' || c === 'business') return c;
  
  return c.replace(/[^\w\s\u0980-\u09FF-]/g, '').replace(/[\s_]+/g, '-') || 'general';
}

/**
 * Generates a clean, URL-safe slug from a course title and optional teacher handle.
 * Handles English and cleans special characters.
 */
export function generateCourseSlug(titleOrSlug: string, teacherHandle?: string): string {
  if (!titleOrSlug) return `course-${Date.now().toString(36)}`;

  let baseSlug = titleOrSlug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) baseSlug = `course-${Date.now().toString(36)}`;

  if (teacherHandle && teacherHandle.trim()) {
    const cleanHandle = teacherHandle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (cleanHandle && !baseSlug.endsWith(cleanHandle)) {
      return `${baseSlug}-${cleanHandle}`;
    }
  }

  return baseSlug;
}

/**
 * Generates the full clean hierarchical URL: /courses/[category]/[course-name]-[teacher-name]
 */
export function generateCourseUrl(course: { id?: string, slug?: string, category?: string, title?: string, teacherHandle?: string, coachingName?: string, instructorName?: string }): string {
  const catSlug = generateCategorySlug(course.category);
  const slug = course.slug || generateCourseSlug(course.title || 'course', course.teacherHandle || course.coachingName || course.instructorName);
  return `/courses/${catSlug}/${slug}`;
}

/**
 * Generates a clean teacher username/handle from name or email.
 */
export function generateTeacherHandle(name?: string, email?: string): string {
  if (name && name.trim()) {
    const fromName = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (fromName) return fromName;
  }

  if (email && email.includes('@')) {
    const emailPrefix = email.split('@')[0]
      .toLowerCase()
      .replace(/[^\w-]/g, '');
    if (emailPrefix) return emailPrefix;
  }

  return `teacher-${Date.now().toString(36)}`;
}

/**
 * Resolves a course by its direct Firestore ID, current clean slug, or previous historical slug.
 * This guarantees 100% link preservation and 0 broken links when courses are renamed.
 */
export async function resolveCourseBySlugOrId(db: Firestore, slugOrId: string) {
  if (!slugOrId) return null;

  try {
    let decoded = slugOrId;
    try {
      decoded = decodeURIComponent(slugOrId);
    } catch (_) {}

    // 1. Direct Document ID Lookup
    const docRef = doc(db, 'courses', slugOrId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.slug && data.title) {
        const autoSlug = generateCourseSlug(data.title, data.coachingName || data.instructorName);
        import('firebase/firestore').then(({ updateDoc }) => {
          updateDoc(docRef, { slug: autoSlug, slugHistory: [autoSlug] }).catch(() => {});
        });
        return { id: docSnap.id, slug: autoSlug, slugHistory: [autoSlug], ...data } as any;
      }
      return { id: docSnap.id, ...data } as any;
    }

    const normalizedSlug = slugOrId.toLowerCase().trim();
    const normalizedDecoded = decoded.toLowerCase().trim();
    const candidates = Array.from(new Set([normalizedSlug, normalizedDecoded])).filter(Boolean);

    const coursesRef = collection(db, 'courses');

    // 2. Lookup by current clean slug
    for (const candidate of candidates) {
      const slugQuery = query(coursesRef, where('slug', '==', candidate), limit(1));
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        const found = slugSnap.docs[0];
        return { id: found.id, ...found.data() } as any;
      }
    }

    // 3. Lookup by historical slug history (for 100% backwards compatibility)
    for (const candidate of candidates) {
      const historyQuery = query(coursesRef, where('slugHistory', 'array-contains', candidate), limit(1));
      const historySnap = await getDocs(historyQuery);
      if (!historySnap.empty) {
        const found = historySnap.docs[0];
        return { id: found.id, ...found.data() } as any;
      }
    }

  } catch (error) {
    console.error("Error resolving course by slug or ID:", error);
  }

  return null;
}
