import { FacebookCapiService } from "./capi/service";

export class Facebook {
	public readonly capi: FacebookCapiService;

	constructor() {
		this.capi = new FacebookCapiService();
	}

	static create(): Facebook {
		return new Facebook();
	}
}
