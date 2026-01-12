import { RedditCapiService } from "./capi/service";

export class Reddit {
	public readonly capi: RedditCapiService;

	constructor() {
		this.capi = new RedditCapiService();
	}

	static create(): Reddit {
		return new Reddit();
	}
}
