// File extracted from cloudflare-typescript SDK

import type * as Core from "../../core";
import { APIResource } from "../../resource";

/**
 * Domain control validation (DCV) method used for this hostname.
 */
export type DCVMethod = "http" | "txt" | "email";

/**
 * Level of validation to be used for this hostname. Domain validation (dv) must be used.
 */
export type DomainValidationType = "dv";

/**
 * A ubiquitous bundle has the highest probability of being verified everywhere,
 * even by clients using outdated or unusual trust stores. An optimal bundle uses
 * the shortest chain and newest intermediates. And the force bundle verifies the
 * chain, but does not otherwise modify it.
 */
export type BundleMethod = "ubiquitous" | "optimal" | "force";

/**
 * The Certificate Authority that will issue the certificate
 */
export type CertificateCA = "digicert" | "google" | "lets_encrypt" | "ssl_com";

export interface CustomHostname {
	/**
	 * Identifier.
	 */
	id: string;

	/**
	 * The custom hostname that will point to your hostname via CNAME.
	 */
	hostname: string;

	ssl: CustomHostname.SSL;

	/**
	 * This is the time the hostname was created.
	 */
	created_at?: string;

	/**
	 * Unique key/value metadata for this hostname. These are per-hostname (customer)
	 * settings.
	 */
	custom_metadata?: { [key: string]: string };

	/**
	 * a valid hostname that's been added to your DNS zone as an A, AAAA, or CNAME
	 * record.
	 */
	custom_origin_server?: string;

	/**
	 * A hostname that will be sent to your custom origin server as SNI for TLS
	 * handshake. This can be a valid subdomain of the zone or custom origin server
	 * name or the string ':request_host_header:' which will cause the host header in
	 * the request to be used as SNI. Not configurable with default/fallback origin
	 * server.
	 */
	custom_origin_sni?: string;

	/**
	 * This is a record which can be placed to activate a hostname.
	 */
	ownership_verification?: CustomHostname.OwnershipVerification;

	/**
	 * This presents the token to be served by the given http url to activate a
	 * hostname.
	 */
	ownership_verification_http?: CustomHostname.OwnershipVerificationHTTP;

	/**
	 * Status of the hostname's activation.
	 */
	status?:
		| "active"
		| "pending"
		| "active_redeploying"
		| "moved"
		| "pending_deletion"
		| "deleted"
		| "pending_blocked"
		| "pending_migration"
		| "pending_provisioned"
		| "test_pending"
		| "test_active"
		| "test_active_apex"
		| "test_blocked"
		| "test_failed"
		| "provisioned"
		| "blocked";

	/**
	 * These are errors that were encountered while trying to activate a hostname.
	 */
	verification_errors?: string[];
}

export namespace CustomHostname {
	export interface SSL {
		/**
		 * Custom hostname SSL identifier tag.
		 */
		id?: string;

		/**
		 * A ubiquitous bundle has the highest probability of being verified everywhere,
		 * even by clients using outdated or unusual trust stores. An optimal bundle uses
		 * the shortest chain and newest intermediates. And the force bundle verifies the
		 * chain, but does not otherwise modify it.
		 */
		bundle_method?: BundleMethod;

		/**
		 * The Certificate Authority that will issue the certificate
		 */
		certificate_authority?: CertificateCA;

		/**
		 * If a custom uploaded certificate is used.
		 */
		custom_certificate?: string;

		/**
		 * The identifier for the Custom CSR that was used.
		 */
		custom_csr_id?: string;

		/**
		 * The key for a custom uploaded certificate.
		 */
		custom_key?: string;

		/**
		 * The time the custom certificate expires on.
		 */
		expires_on?: string;

		/**
		 * A list of Hostnames on a custom uploaded certificate.
		 */
		hosts?: string[];

		/**
		 * The issuer on a custom uploaded certificate.
		 */
		issuer?: string;

		/**
		 * Domain control validation (DCV) method used for this hostname.
		 */
		method?: DCVMethod;

		/**
		 * The serial number on a custom uploaded certificate.
		 */
		serial_number?: string;

		settings?: SSL.Settings;

		/**
		 * The signature on a custom uploaded certificate.
		 */
		signature?: string;

		/**
		 * Status of the hostname's SSL certificates.
		 */
		status?:
			| "initializing"
			| "pending_validation"
			| "deleted"
			| "pending_issuance"
			| "pending_deployment"
			| "pending_deletion"
			| "pending_expiration"
			| "expired"
			| "active"
			| "initializing_timed_out"
			| "validation_timed_out"
			| "issuance_timed_out"
			| "deployment_timed_out"
			| "deletion_timed_out"
			| "pending_cleanup"
			| "staging_deployment"
			| "staging_active"
			| "deactivating"
			| "inactive"
			| "backup_issued"
			| "holding_deployment";

		/**
		 * Level of validation to be used for this hostname. Domain validation (dv) must be
		 * used.
		 */
		type?: DomainValidationType;

		/**
		 * The time the custom certificate was uploaded.
		 */
		uploaded_on?: string;

		/**
		 * Domain validation errors that have been received by the certificate authority
		 * (CA).
		 */
		validation_errors?: SSL.ValidationError[];

		validation_records?: SSL.ValidationRecord[];

		/**
		 * Indicates whether the certificate covers a wildcard.
		 */
		wildcard?: boolean;
	}

	export namespace SSL {
		export interface Settings {
			/**
			 * An allowlist of ciphers for TLS termination. These ciphers must be in the
			 * BoringSSL format.
			 */
			ciphers?: string[];

			/**
			 * Whether or not Early Hints is enabled.
			 */
			early_hints?: "on" | "off";

			/**
			 * Whether or not HTTP2 is enabled.
			 */
			http2?: "on" | "off";

			/**
			 * The minimum TLS version supported.
			 */
			min_tls_version?: "1.0" | "1.1" | "1.2" | "1.3";

			/**
			 * Whether or not TLS 1.3 is enabled.
			 */
			tls_1_3?: "on" | "off";
		}

		export interface ValidationError {
			/**
			 * A domain validation error.
			 */
			message?: string;
		}

		export interface ValidationRecord {
			/**
			 * The set of email addresses that the certificate authority (CA) will use to
			 * complete domain validation.
			 */
			emails?: string[];

			/**
			 * The content that the certificate authority (CA) will expect to find at the
			 * http_url during the domain validation.
			 */
			http_body?: string;

			/**
			 * The url that will be checked during domain validation.
			 */
			http_url?: string;

			/**
			 * The hostname that the certificate authority (CA) will check for a TXT record
			 * during domain validation .
			 */
			txt_name?: string;

			/**
			 * The TXT record that the certificate authority (CA) will check during domain
			 * validation.
			 */
			txt_value?: string;
		}
	}

	/**
	 * This is a record which can be placed to activate a hostname.
	 */
	export interface OwnershipVerification {
		/**
		 * DNS Name for record.
		 */
		name?: string;

		/**
		 * DNS Record type.
		 */
		type?: "txt";

		/**
		 * Content for the record.
		 */
		value?: string;
	}

	/**
	 * This presents the token to be served by the given http url to activate a
	 * hostname.
	 */
	export interface OwnershipVerificationHTTP {
		/**
		 * Token to be served.
		 */
		http_body?: string;

		/**
		 * The HTTP URL that will be checked during custom hostname verification and where
		 * the customer should host the token.
		 */
		http_url?: string;
	}
}

export type CustomHostnameCreateResponse = CustomHostname;
export type CustomHostnameGetResponse = CustomHostname;

export interface CustomHostnameDeleteResponse {
	/**
	 * Identifier.
	 */
	id?: string;
}

export interface CustomHostnameCreateParams {
	/**
	 * Path param: Identifier.
	 */
	zone_id: string;

	/**
	 * Body param: The custom hostname that will point to your hostname via CNAME.
	 */
	hostname: string;

	/**
	 * Body param: SSL properties used when creating the custom hostname.
	 */
	ssl: CustomHostnameCreateParams.SSL;

	/**
	 * Body param: Unique key/value metadata for this hostname. These are per-hostname
	 * (customer) settings.
	 */
	custom_metadata?: { [key: string]: string };
}

export namespace CustomHostnameCreateParams {
	/**
	 * SSL properties used when creating the custom hostname.
	 */
	export interface SSL {
		/**
		 * A ubiquitous bundle has the highest probability of being verified everywhere,
		 * even by clients using outdated or unusual trust stores. An optimal bundle uses
		 * the shortest chain and newest intermediates. And the force bundle verifies the
		 * chain, but does not otherwise modify it.
		 */
		bundle_method?: BundleMethod;

		/**
		 * The Certificate Authority that will issue the certificate
		 */
		certificate_authority?: CertificateCA;

		/**
		 * Whether or not to add Cloudflare Branding for the order. This will add a
		 * subdomain of sni.cloudflaressl.com as the Common Name if set to true
		 */
		cloudflare_branding?: boolean;

		/**
		 * If a custom uploaded certificate is used.
		 */
		custom_certificate?: string;

		/**
		 * The key for a custom uploaded certificate.
		 */
		custom_key?: string;

		/**
		 * Domain control validation (DCV) method used for this hostname.
		 */
		method?: DCVMethod;

		/**
		 * SSL specific settings.
		 */
		settings?: SSL.Settings;

		/**
		 * Level of validation to be used for this hostname. Domain validation (dv) must be
		 * used.
		 */
		type?: DomainValidationType;

		/**
		 * Indicates whether the certificate covers a wildcard.
		 */
		wildcard?: boolean;
	}

	export namespace SSL {
		/**
		 * SSL specific settings.
		 */
		export interface Settings {
			/**
			 * An allowlist of ciphers for TLS termination. These ciphers must be in the
			 * BoringSSL format.
			 */
			ciphers?: string[];

			/**
			 * Whether or not Early Hints is enabled.
			 */
			early_hints?: "on" | "off";

			/**
			 * Whether or not HTTP2 is enabled.
			 */
			http2?: "on" | "off";

			/**
			 * The minimum TLS version supported.
			 */
			min_tls_version?: "1.0" | "1.1" | "1.2" | "1.3";

			/**
			 * Whether or not TLS 1.3 is enabled.
			 */
			tls_1_3?: "on" | "off";
		}
	}
}

export interface CustomHostnameGetParams {
	/**
	 * Identifier.
	 */
	zone_id: string;
}

export interface CustomHostnameDeleteParams {
	/**
	 * Identifier.
	 */
	zone_id: string;
}

export class CustomHostnames extends APIResource {
	/**
	 * Add a new custom hostname and request that an SSL certificate be issued for it.
	 * One of three validation methods—http, txt, email—should be used, with 'http'
	 * recommended if the CNAME is already in place (or will be soon). Specifying
	 * 'email' will send an email to the WHOIS contacts on file for the base domain
	 * plus hostmaster, postmaster, webmaster, admin, administrator. If http is used
	 * and the domain is not already pointing to the Managed CNAME host, the PATCH
	 * method must be used once it is (to complete validation). Enable bundling of
	 * certificates using the custom_cert_bundle field. The bundling process requires
	 * the following condition One certificate in the bundle must use an RSA, and the
	 * other must use an ECDSA.
	 *
	 * @example
	 * ```ts
	 * const customHostname = await client.customHostnames.create({
	 *   zone_id: '023e105f4ecef8ad9ca31a8372d0c353',
	 *   hostname: 'app.example.com',
	 *   ssl: {},
	 * });
	 * ```
	 */
	create(
		params: CustomHostnameCreateParams,
		options?: Core.RequestOptions,
	): Core.APIPromise<CustomHostnameCreateResponse> {
		const { zone_id, ...body } = params;
		return this._client
			.post<CustomHostnameCreateResponse>(`/zones/${zone_id}/custom_hostnames`, body, options)
			._thenUnwrap((obj) => obj.result);
	}

	/**
	 * Custom Hostname Details
	 *
	 * @example
	 * ```ts
	 * const customHostname = await client.customHostnames.get(
	 *   '023e105f4ecef8ad9ca31a8372d0c353',
	 *   { zone_id: '023e105f4ecef8ad9ca31a8372d0c353' },
	 * );
	 * ```
	 */
	get(
		customHostnameId: string,
		params: CustomHostnameGetParams,
		options?: Core.RequestOptions,
	): Core.APIPromise<CustomHostnameGetResponse> {
		const { zone_id } = params;
		return this._client
			.get<CustomHostnameGetResponse>(
				`/zones/${zone_id}/custom_hostnames/${customHostnameId}`,
				options,
			)
			._thenUnwrap((obj) => obj.result);
	}

	/**
	 * Delete Custom Hostname (and any issued SSL certificates)
	 *
	 * @example
	 * ```ts
	 * const customHostname = await client.customHostnames.delete(
	 *   '023e105f4ecef8ad9ca31a8372d0c353',
	 *   { zone_id: '023e105f4ecef8ad9ca31a8372d0c353' },
	 * );
	 * ```
	 */
	delete(
		customHostnameId: string,
		params: CustomHostnameDeleteParams,
		options?: Core.RequestOptions,
	): Core.APIPromise<CustomHostnameDeleteResponse> {
		const { zone_id } = params;
		return this._client
			.delete<CustomHostnameDeleteResponse>(
				`/zones/${zone_id}/custom_hostnames/${customHostnameId}`,
				options,
			)
			._thenUnwrap((obj) => obj.result);
	}
}
