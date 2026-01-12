import { TikTokCapiService } from "./capi/service";

export class TikTok {
	public readonly capi: TikTokCapiService;

	constructor() {
		this.capi = new TikTokCapiService();
	}

	static create(): TikTok {
		return new TikTok();
	}
}
