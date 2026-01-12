// Singleton Manager for all platforms
import { Facebook } from "../facebook/service";
import { Kwai } from "../kwai/service";
import { Pinterest } from "../pinterest/service";
import { Reddit } from "../reddit/service";
import { TikTok } from "../tiktok/service";

export class PlatformService {
	public readonly facebook: Facebook;
	public readonly tiktok: TikTok;
	public readonly reddit: Reddit;
	public readonly pinterest: Pinterest;
	public readonly kwai: Kwai;

	constructor() {
		this.facebook = new Facebook();
		this.tiktok = new TikTok();
		this.reddit = new Reddit();
		this.pinterest = new Pinterest();
		this.kwai = new Kwai();
	}

	static create(): PlatformService {
		return new PlatformService();
	}
}
