import { PinterestCapiService } from "./capi/service";

export class Pinterest {
	public readonly capi: PinterestCapiService;

	constructor() {
		this.capi = new PinterestCapiService();
	}

	static create(): Pinterest {
		return new Pinterest();
	}
}
