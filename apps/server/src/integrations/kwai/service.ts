import { KwaiCapiService } from "./capi/service";

export class Kwai {
	public readonly capi: KwaiCapiService;

	constructor() {
		this.capi = new KwaiCapiService();
	}

	static create(): Kwai {
		return new Kwai();
	}
}
