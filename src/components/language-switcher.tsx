"use client";

import { useLocale } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={pathname} locale="en" className="flex items-center justify-between w-full cursor-pointer">
                        English
                        {locale === 'en' && <Check className="h-4 w-4 ml-2" />}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={pathname} locale="es" className="flex items-center justify-between w-full cursor-pointer">
                        Español
                        {locale === 'es' && <Check className="h-4 w-4 ml-2" />}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
