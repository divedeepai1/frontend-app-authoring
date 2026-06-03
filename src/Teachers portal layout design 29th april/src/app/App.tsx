import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MyClasses from './components/MyClasses';
import ManageCourse from './components/ManageCourse';
import Reports from './components/Reports';
import AdditionalResources from './components/AdditionalResources';
import { Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('manage-class-students');

  const getPageContent = () => {
    switch (activeTab) {
      case 'manage-class-students':
        return {
          title: '',
          subtitle: '',
          content: <MyClasses />
        };
      case 'manage-course-curriculum':
        return {
          title: '',
          subtitle: '',
          content: <ManageCourse />
        };
      case 'reports':
        return {
          title: '',
          subtitle: '',
          content: <Reports />
        };
      case 'additional-resources':
        return {
          title: '',
          subtitle: '',
          content: <AdditionalResources />
        };
      default:
        return {
          title: '',
          subtitle: '',
          content: <MyClasses />
        };
    }
  };

  const pageContent = getPageContent();

  return (
    <div className="size-full flex bg-[#f9fafb]" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Toaster position="top-right" expand={true} richColors />
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={pageContent.title} subtitle={pageContent.subtitle} />

        <main className="flex-1 p-6 overflow-auto">
          {pageContent.content}
        </main>
      </div>
    </div>
  );
}