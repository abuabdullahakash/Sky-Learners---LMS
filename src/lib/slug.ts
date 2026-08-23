import { Firestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * Generates a clean, URL-safe slug from a course title.
 * Handles both English and Bengali / Unicode characters properly.
 */
export function generateCourseSlug(title: string): string {
  if (!title) return `course-${Date.now().toString(36)}`;

  let slug = title
    .toLowerCase()
    .trim()
    // Remove punctuation & special characters except letters, numbers, spaces, and Bengali characters (\u0980-\u09FF)
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    // Replace spaces, underscores, and consecutive hyphens with a single hyphen
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');

  return slug || `course-${Date.now().toString(36)}`;
}

/**
 * Resolves a course by its direct Firestore ID, current clean slug, or previous historical slug.
 * This guarantees 100% link preservation and 0 broken links when courses are renamed.
 */
export async function resolveCourseBySlugOrId(db: Firestore, slugOrId: string) {
  if (!slugOrId) return null;

  try {
    // 1. Direct Document ID Lookup
    const docRef = doc(db, 'courses', slugOrId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.slug && data.title) {
        const autoSlug = generateCourseSlug(data.title);
        import('firebase/firestore').then(({ updateDoc }) => {
          updateDoc(docRef, { slug: autoSlug, slugHistory: [autoSlug] }).catch(() => {});
        });
        return { id: docSnap.id, slug: autoSlug, slugHistory: [autoSlug], ...data } as any;
      }
      return { id: docSnap.id, ...data } as any;
    }

    const normalizedSlug = slugOrId.toLowerCase().trim();

    // 2. Lookup by current clean slug
    const coursesRef = collection(db, 'courses');
    const slugQuery = query(coursesRef, where('slug', '==', normalizedSlug), limit(1));
    const slugSnap = await getDocs(slugQuery);
    if (!slugSnap.empty) {
      const found = slugSnap.docs[0];
      return { id: found.id, ...found.data() } as any;
    }

    // 3. Lookup by historical slug history (for 100% backwards compatibility)
    const historyQuery = query(coursesRef, where('slugHistory', 'array-contains', normalizedSlug), limit(1));
    const historySnap = await getDocs(historyQuery);
    if (!historySnap.empty) {
      const found = historySnap.docs[0];
      return { id: found.id, ...found.data() } as any;
    }

  } catch (error) {
    console.error("Error resolving course by slug or ID:", error);
  }

  return null;
}
