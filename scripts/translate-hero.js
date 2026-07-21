const fs = require('fs');
const path = require('path');
const base = 'src/app/[locale]/dashboard/courses/[courseId]';

const filesToUpdate = {
  'community/page.tsx': { title: 'communityTitle', subtitle: 'communitySubtitle' },
  'exams/page.tsx': { title: 'examsTitle', subtitle: 'examsSubtitle' },
  'live-classes/page.tsx': { title: 'liveClassesTitle', subtitle: 'liveClassesSubtitle' },
  'recorded-classes/page.tsx': { title: 'recordedClassesTitle', subtitle: 'recordedClassesSubtitle' },
  'resources/page.tsx': { title: 'resourcesTitle', subtitle: 'resourcesSubtitle' },
  'syllabus/page.tsx': { title: 'syllabusTitle', subtitle: 'syllabusSubtitle' }
};

for (const [file, keys] of Object.entries(filesToUpdate)) {
  const filePath = path.join(base, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if missing
    if (!content.includes('import { useTranslations }')) {
      content = content.replace('"use client";', '"use client";\nimport { useTranslations } from \'next-intl\';');
    }
    
    // Add tHero initialization just after the component declaration
    const funcMatch = content.match(/export default function[^{]+\{/);
    if (funcMatch && !content.includes('const tHero = useTranslations(')) {
      const insertIdx = funcMatch.index + funcMatch[0].length;
      content = content.substring(0, insertIdx) + '\n  const tHero = useTranslations(\'Dashboard.studentHero\');' + content.substring(insertIdx);
    }

    // Replace texts
    content = content.replace(/>Student Dashboard</g, '>{tHero(\'badge\')}<');
    
    // Custom replace for titles and subtitles based on previous known texts:
    
    // For h1:
    content = content.replace(/(<h1[^>]*>).*?(<\/h1>)/s, (match, p1, p2) => {
      // Keep any icon inside h1 if it exists
      if(match.includes('<MessageSquare')) return p1 + '\n              <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />\n              {tHero(\'' + keys.title + '\')}\n            ' + p2;
      if(match.includes('<FileText')) return p1 + '\n              <FileText className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />\n              {tHero(\'' + keys.title + '\')}\n            ' + p2;
      return p1 + '{tHero(\'' + keys.title + '\')}' + p2;
    });

    // For Exams page which used {t('takeYourExams')}
    content = content.replace(/\{t\('takeYourExams'\)\}/g, '{tHero(\'examsSubtitle\')}');
    
    // For live-classes and community which used {t('subtitle')}
    content = content.replace(/\{t\('subtitle'\)\}/g, '{tHero(\'' + keys.subtitle + '\')}');

    // For hardcoded <p> tags
    if (file === 'recorded-classes/page.tsx') {
      content = content.replace(/<p className="text-gray-300 text-sm font-medium">Watch your class recordings and download notes.<\/p>/g, '<p className="text-gray-300 text-sm font-medium">{tHero(\'recordedClassesSubtitle\')}</p>');
    } else if (file === 'resources/page.tsx') {
      content = content.replace(/<p className="text-gray-300 text-sm font-medium">Access all course notes, PDFs, slides, and materials shared by your instructor.<\/p>/g, '<p className="text-gray-300 text-sm font-medium">{tHero(\'resourcesSubtitle\')}</p>');
    } else if (file === 'syllabus/page.tsx') {
      content = content.replace(/<p className="text-gray-300 text-sm font-medium">Explore the detailed curriculum and learning path.<\/p>/g, '<p className="text-gray-300 text-sm font-medium">{tHero(\'syllabusSubtitle\')}</p>');
    }

    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  }
}
