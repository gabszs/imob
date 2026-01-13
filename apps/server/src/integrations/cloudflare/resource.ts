// File extracted from cloudflare-typescript SDK

import { type Cloudflare } from "./index";

export abstract class APIResource {
	protected _client: Cloudflare;

	constructor(client: Cloudflare) {
		this._client = client;
	}
}
