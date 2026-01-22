import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/chat': 'Chat',
  '/roleplay': 'Roleplay',
  '/exam': 'Exam',
  '/exam/mock': 'Mock Exam',
  '/writing': 'Writing',
  '/dictionary': 'Dictionary',
  '/flashcards': 'Flashcards',
  '/mindmap': 'Mindmap',
  '/study-plan': 'Study Plan',
  '/settings': 'Settings',
  '/adminpanel': 'Admin',
  '/adminpanel/overview': 'Overview',
  '/adminpanel/usage': 'Usage',
  '/adminpanel/users': 'Users',
  '/adminpanel/classes': 'Classes',
  '/adminpanel/assignments': 'Assignments',
  '/adminpanel/submissions': 'Submissions',
  '/adminpanel/safety': 'Safety',
  '/adminpanel/system': 'System',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const crumbs = pathSegments.map((_, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      path,
      label: breadcrumbMap[path] ?? pathSegments[index],
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-stone-900">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            <span>/</span>
            {index === crumbs.length - 1 ? (
              <span className="text-stone-900">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-stone-900">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
