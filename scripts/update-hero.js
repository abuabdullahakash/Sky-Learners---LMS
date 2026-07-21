const fs = require('fs');
const path = require('path');
const base = 'src/app/[locale]/dashboard/courses/[courseId]';
const pages = ['community/page.tsx', 'exams/page.tsx', 'live-classes/page.tsx', 'recorded-classes/page.tsx', 'resources/page.tsx', 'syllabus/page.tsx'];

pages.forEach(file => {
  const filePath = path.join(base, file);
  if (fs.existsSync(filePath)) {
    let c = fs.readFileSync(filePath, 'utf8');
    c = c.replace(/rounded-2xl overflow-hidden/g, 'rounded-none overflow-hidden');
    fs.writeFileSync(filePath, c);
    console.log('Updated', file);
  }
});
