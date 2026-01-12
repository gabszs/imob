import { Separator } from "@/web/components/ui/separator";
import { PERSONAL_SITE_URL } from "@/web/lib/constants";

export function Footer() {
	return (
		<div className="mt-12 pb-16">
			<Separator className="my-8" />
			<p className="text-muted-foreground text-sm">
				A powerful event tracking platform with CAPI pixels for modern ad
				campaigns. Visit {""}
				<a href={PERSONAL_SITE_URL} className="underline">
					gabrielcarvalho.dev
				</a>{" "}
				to learn more about my work.
			</p>
		</div>
	);
}
