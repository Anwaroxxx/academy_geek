import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-beta text-white dark:bg-sidebar-primary">
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
        </div>
    );
}
