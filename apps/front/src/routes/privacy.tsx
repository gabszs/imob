import { createFileRoute } from "@tanstack/react-router";

const _subtleLinkClass =
	"relative inline-block text-current no-underline after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-200 after:ease-out after:content-[''] hover:after:w-full focus-visible:after:w-full focus-visible:outline-none";

export const Route = createFileRoute("/privacy")({
	component: PrivacyRoute,
});

function PrivacyRoute() {
	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-4xl px-8 py-12">
				<header className="mb-12">
					<h1 className="font-normal text-xl uppercase tracking-wide">
						PRIVACY POLICY
					</h1>
					<p className="mt-1 text-sm italic opacity-80">
						LAST UPDATED: OCTOBER 2025
					</p>
				</header>

				<div className="space-y-12 text-base leading-snug">
					<section>
						<h2 className="mb-4 font-normal uppercase">Introduction</h2>
						<div className="space-y-4 opacity-90">
							<p>
								We value your privacy and are committed to safeguarding your
								personal data. This privacy policy explains how we collect, use,
								store, and protect your information when you use our
								application, as well as your privacy rights and how they are
								protected by law.
							</p>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Data We Collect</h2>
						<div className="space-y-4 opacity-90">
							<div>
								<p className="mb-2 font-normal">Authentication Data</p>
								<ul className="ml-4 space-y-1">
									<li>→ Email address (required for account creation)</li>
									<li>→ Name (from OAuth providers or user input)</li>
									<li>→ Profile image (optional, from OAuth providers)</li>
									<li>→ Email verification status</li>
									<li>
										→ OAuth tokens (when using Google or GitHub sign-in, stored
										securely)
									</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">Session & Security Data</p>
								<ul className="ml-4 space-y-1">
									<li>→ Session tokens</li>
									<li>→ IP address (for security and rate limiting)</li>
									<li>→ User agent (browser/device information)</li>
									<li>→ Rate limiting metadata</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">User Content & Activity</p>
								<ul className="ml-4 space-y-1">
									<li>→ User-generated content and data</li>
									<li>→ Usage statistics and activity timestamps</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">Settings & Preferences</p>
								<ul className="ml-4 space-y-1">
									<li>→ Theme preference (light/dark/system)</li>
									<li>→ User interface preferences</li>
								</ul>
							</div>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">
							How We Store Your Data
						</h2>
						<div className="space-y-4 opacity-90">
							<p>
								We use secure cloud infrastructure designed for privacy,
								security, and performance:
							</p>

							<div>
								<p className="mb-2 font-normal">Security Measures</p>
								<ul className="ml-4 space-y-1">
									<li>→ All data transmitted over secure HTTPS connections</li>
									<li>→ Secure, HTTP-only cookies with modern protections</li>
									<li>→ Industry-standard encryption for sensitive data</li>
								</ul>
							</div>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">How We Use Your Data</h2>
						<div className="space-y-4 opacity-90">
							<p>We use your data solely to provide and improve our service:</p>
							<ul className="ml-4 space-y-1">
								<li>→ Authenticate and maintain your account</li>
								<li>→ Process your requests and provide features</li>
								<li>→ Maintain your preferences and settings</li>
								<li>→ Secure your account and prevent abuse</li>
							</ul>
							<p>
								We do not use your data for advertising, marketing, or any
								purpose beyond operating the service.
							</p>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Your Privacy Rights</h2>
						<div className="space-y-4 opacity-90">
							<p>
								You have the following rights concerning your personal data:
							</p>

							<div>
								<p className="mb-2 font-normal">Access</p>
								<ul className="ml-4 space-y-1">
									<li>→ View your account data and settings through the app</li>
									<li>→ Request a copy of your data by contacting us</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">Correction</p>
								<ul className="ml-4 space-y-1">
									<li>→ Update your profile information in account settings</li>
									<li>→ Modify your preferences anytime</li>
								</ul>
							</div>

							<div>
								<p className="mb-2 font-normal">
									Deletion (Right to be Forgotten)
								</p>
								<ul className="ml-4 space-y-1">
									<li>
										→ Delete your account using the "Delete Account" button in
										profile settings
									</li>
									<li>→ Account deletion removes all associated data</li>
									<li>
										→ Sessions are automatically deleted upon logout or
										expiration
									</li>
								</ul>
							</div>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Cookies & Tracking</h2>
						<div className="space-y-4 opacity-90">
							<p>
								We use only essential cookies necessary for authentication and
								session management:
							</p>
							<ul className="ml-4 space-y-1">
								<li>→ Session cookies (authentication and login state)</li>
								<li>→ Security cookies (CSRF protection)</li>
								<li>→ Preference cookies (theme, locale)</li>
							</ul>
							<p>
								All cookies are secure, HTTP-only, and use SameSite protection.
								We do not use cookies for advertising, analytics, or tracking
								across websites.
							</p>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">
							Changes to This Policy
						</h2>
						<div className="space-y-4 opacity-90">
							<p>
								We may update this privacy policy from time to time to reflect
								changes in our practices or for legal reasons. Any changes will
								be posted on this page with an updated "Last Updated" date.
								Continued use of the application after changes indicates
								acceptance of the updated policy.
							</p>
						</div>
					</section>

					<section>
						<h2 className="mb-4 font-normal uppercase">Contact Us</h2>
						<div className="space-y-4 opacity-90">
							<p>
								If you have questions, concerns, or requests regarding this
								privacy policy or your personal data, please contact us.
							</p>
						</div>
					</section>

					<section className="mt-16 border-current/10 border-t pt-12">
						<div className="text-sm italic opacity-70">
							<p>
								By using this application, you acknowledge that you have read
								and understood this Privacy Policy and agree to its terms.
							</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
