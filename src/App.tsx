import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomeToolPage } from './pages/HomeToolPage';
import { LegalPage } from './pages/LegalPage';
import { RouteMeta } from './seo/Helmet';
import { SEO_PAGES } from './seo/pages';
import { JsonLd } from './components/JsonLd';

function App() {
  const location = useLocation();
  const seoPage = SEO_PAGES.find((p) => p.path === location.pathname) ?? SEO_PAGES[0];

  return (
    <Layout>
      <RouteMeta />
      {location.pathname !== '/' && seoPage.faq.length + seoPage.paragraphs.length > 0 ? (
        <JsonLd page={seoPage} />
      ) : null}
      <Routes>
        <Route path="/" element={<HomeToolPage />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/about" element={<LegalPage kind="about" />} />
        <Route path="/contact" element={<LegalPage kind="contact" />} />
      </Routes>
    </Layout>
  );
}

export default App;