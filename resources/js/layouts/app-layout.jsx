import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';


export default function AppLayout({
  breadcrumbs = [],
  children



}) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs}>
      <div
        className={`bg-light dark:bg-dark  mx-auto my-6 h-full w-[96%] rounded-lg shadow-lg`}

      >
        {children}

      </div>
    </AppLayoutTemplate>);

}